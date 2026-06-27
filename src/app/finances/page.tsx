import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  createBill, createIncomeEntry, 
  markBillAsPaid, logIncomePayment 
} from "@/app/actions/finances";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Bill, IncomeEntry } from "@prisma/client";

export default async function FinancesPage() {
  const user = await getMockUser();

  const bills = (await db.bill.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
  })) as Bill[];

  const incomes = (await db.incomeEntry.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
  })) as IncomeEntry[];

  const unpaidBills = bills.filter(b => b.status !== "PAID");
  const totalUnpaidBills = unpaidBills.reduce((acc, b) => acc + b.amount, 0);
  
  const pendingIncome = incomes.filter(i => i.status !== "PAID");
  const totalPendingIncome = pendingIncome.reduce((acc, i) => acc + (i.totalAmount - i.amountPaid), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PARTIAL": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "OVERDUE": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  return (
    <PageShell
      title="Finances"
      description="Track your bills, income, and cash flow."
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unpaid Bills</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">${totalUnpaidBills.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{unpaidBills.length} pending obligations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${totalPendingIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{pendingIncome.length} active receivables</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cashflow (Pending)</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(totalPendingIncome - totalUnpaidBills) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(totalPendingIncome - totalUnpaidBills).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Expected incoming minus outgoing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" /> Bills & Obligations
            </h2>

            <Card>
              <CardHeader><CardTitle className="text-base">Add New Bill</CardTitle></CardHeader>
              <CardContent>
                <form action={createBill} className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input name="name" placeholder="Bill Name (e.g., Apartment Rent)" required />
                  </div>
                  <Input name="amount" type="number" step="0.01" placeholder="Amount ($)" required />
                  <DatePicker name="dueDate" required />
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input type="checkbox" name="isRecurring" id="isRecurring" className="h-4 w-4" />
                    <Label htmlFor="isRecurring">Recurring Bill</Label>
                  </div>
                  <div className="sm:col-span-2">
                    <select name="frequency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="ONE_TIME">One Time</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                  <Button type="submit" className="sm:col-span-2">Add Bill</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {bills.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No bills added yet.</p>}
              {bills.map((bill) => (
                <Card key={bill.id} className={bill.status === "PAID" ? "opacity-60" : ""}>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{bill.title}</h3>
                        <Badge variant="outline" className={getStatusColor(bill.status)}>{bill.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(bill.dueDate).toLocaleDateString()} 
                        {bill.isRecurring && ` • Repeats ${bill.frequency.toLowerCase().replace("_", " ")}`}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:items-end">
                      <span className="text-lg font-bold">${bill.amount.toFixed(2)}</span>
                      {bill.status !== "PAID" && (
                        <form action={markBillAsPaid} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="billId" value={bill.id} />
                          <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" name="createTransaction" defaultChecked className="h-3 w-3" />
                            Log tx
                          </label>
                          <Button type="submit" size="sm" variant="outline" className="text-green-500 border-green-500/50 hover:bg-green-500/10">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Paid
                          </Button>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" /> Income & Receivables
            </h2>

            <Card>
              <CardHeader><CardTitle className="text-base">Log Expected Income</CardTitle></CardHeader>
              <CardContent>
                <form action={createIncomeEntry} className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input name="sourceName" placeholder="Source (e.g., Client A, Part-time Job)" required />
                  </div>
                  <Input name="totalAmount" type="number" step="0.01" placeholder="Total Expected ($)" required />
                  <DatePicker name="dueDate" required />
                  <Button type="submit" className="sm:col-span-2">Add Income</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {incomes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No income tracked yet.</p>}
              {incomes.map((income) => {
                const progressPercent = (income.amountPaid / income.totalAmount) * 100;
                const remaining = income.totalAmount - income.amountPaid;

                return (
                  <Card key={income.id} className={income.status === "PAID" ? "opacity-60" : ""}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{income.sourceName}</h3>
                            <Badge variant="outline" className={getStatusColor(income.status)}>{income.status}</Badge>
                          </div>
{income.dueDate && (
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(income.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="sm:text-right">
                          <p className="text-lg font-bold text-green-400">${income.amountPaid.toFixed(2)} <span className="text-sm text-muted-foreground font-normal">/ ${income.totalAmount.toFixed(2)}</span></p>
                          {income.status !== "PAID" && <p className="text-xs text-muted-foreground">${remaining.toFixed(2)} remaining</p>}
                        </div>
                      </div>

                      <Progress value={progressPercent} className="h-2" />

                      {income.status !== "PAID" && (
                        <form action={logIncomePayment} className="flex flex-col gap-2 border-t pt-2 sm:flex-row">
                          <input type="hidden" name="incomeId" value={income.id} />
                          <Input 
                            name="newPayment" 
                            type="number" 
                            step="0.01" 
                            placeholder="Log payment amount..." 
                            className="flex-1 h-8 text-sm" 
                            required 
                          />
                          <Button type="submit" size="sm" variant="outline" className="h-8">
                            <DollarSign className="h-3 w-3 mr-1" /> Log
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
