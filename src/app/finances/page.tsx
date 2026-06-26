import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { createTransaction } from "@/lib/omni-actions";

export default async function FinancesPage() {
  const transactions = await db.transaction.findMany({
    orderBy: { date: "desc" },
    take: 10,
    select: {
      id: true,
      description: true,
      category: true,
      amount: true,
      isPending: true,
      date: true,
    },
  });

  const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <PageShell
      title="Finances"
      description="Monitor accounts, cash flow, and upcoming bills in one place."
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form action={createTransaction} className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Log transaction</h2>
            <p className="text-sm text-muted-foreground">Capture income, bills, and everyday spending.</p>
          </div>
          <Input name="description" placeholder="Description" required />
          <Input name="category" placeholder="Category" defaultValue="General" />
          <Input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required />
          <select name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="isPending" />
            Mark as pending
          </label>
          <Button type="submit">Save transaction</Button>
        </form>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Current balance</p>
            <p className="mt-2 text-3xl font-semibold">${balance.toFixed(2)}</p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm">
            <h3 className="font-semibold">Recent ledger</h3>
            <div className="mt-4 space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/70 p-3">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category || "General"}</p>
                  </div>
                  <div className="text-right">
                    <p className={transaction.amount >= 0 ? "font-semibold text-emerald-400" : "font-semibold text-rose-400"}>
                      {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    {transaction.isPending ? <p className="text-xs text-amber-400">Pending</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
