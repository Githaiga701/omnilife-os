"use server";

import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { BillSchema, IncomeEntrySchema, safeParse } from "@/lib/validation";
import { revalidateAll, handleServerError } from "@/lib/server-utils";

async function ensureDefaultAccount(userId: string) {
  const existing = await db.account.findFirst({
    where: { userId, name: "Primary Account" },
  });
  if (existing) return existing;
  return db.account.create({
    data: { userId, name: "Primary Account", type: "CHECKING", balance: 0 },
  });
}

async function verifyBillOwnership(billId: string, userId: string) {
  const bill = await db.bill.findUnique({ where: { id: billId } });
  if (!bill || bill.userId !== userId) {
    throw new Error("Bill not found or access denied");
  }
  return bill;
}

async function verifyIncomeOwnership(incomeId: string, userId: string) {
  const income = await db.incomeEntry.findUnique({ where: { id: incomeId } });
  if (!income || income.userId !== userId) {
    throw new Error("Income entry not found or access denied");
  }
  return income;
}

export async function createBill(formData: FormData) {
  try {
    const user = await getMockUser();
    const parsed = safeParse(BillSchema, {
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount") as string),
      dueDate: formData.get("dueDate"),
      isRecurring: formData.get("isRecurring") === "on",
      frequency: formData.get("frequency") || "ONE_TIME",
    });
    if (!parsed.success) throw new Error(parsed.error);

    const { name, amount, dueDate, isRecurring, frequency } = parsed.data;

    await db.bill.create({
      data: { userId: user.id, title: name, amount, dueDate, isRecurring, frequency, status: "UNPAID" },
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "createBill");
    throw e;
  }
}

export async function createIncomeEntry(formData: FormData) {
  try {
    const user = await getMockUser();
    const parsed = safeParse(IncomeEntrySchema, {
      sourceName: formData.get("sourceName"),
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      dueDate: formData.get("dueDate"),
    });
    if (!parsed.success) throw new Error(parsed.error);

    const { sourceName, totalAmount, dueDate } = parsed.data;

    await db.incomeEntry.create({
      data: { userId: user.id, sourceName, totalAmount, dueDate, status: "PENDING", amountPaid: 0 },
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "createIncomeEntry");
    throw e;
  }
}

export async function markBillAsPaid(formData: FormData) {
  try {
    const user = await getMockUser();
    const billId = formData.get("billId") as string;
    if (!billId) throw new Error("Bill ID is required");

    const bill = await verifyBillOwnership(billId, user.id);
    const createTransaction = formData.get("createTransaction") === "on";

    await db.bill.update({
      where: { id: billId },
      data: { status: "PAID" },
    });

    if (createTransaction) {
      const account = await ensureDefaultAccount(user.id);
      const tx = await db.transaction.create({
        data: {
          accountId: account.id,
          userId: user.id,
          amount: -bill.amount,
          description: `Paid: ${bill.title}`,
          category: "Bills",
        },
      });
      await db.bill.update({
        where: { id: billId },
        data: { transactionId: tx.id },
      });
    }

    revalidateAll();
  } catch (e) {
    handleServerError(e, "markBillAsPaid");
    throw e;
  }
}

export async function logIncomePayment(formData: FormData) {
  try {
    const user = await getMockUser();
    const incomeId = formData.get("incomeId") as string;
    const newPayment = parseFloat(formData.get("newPayment") as string);

    if (!incomeId) throw new Error("Income ID is required");
    if (isNaN(newPayment) || newPayment <= 0) throw new Error("Invalid payment amount");

    const income = await verifyIncomeOwnership(incomeId, user.id);

    const updatedPaid = income.amountPaid + newPayment;
    if (updatedPaid > income.totalAmount) throw new Error("Total payment exceeds expected amount");

    const status = updatedPaid >= income.totalAmount ? "PAID" : "PARTIAL";

    await db.incomeEntry.update({
      where: { id: incomeId },
      data: { amountPaid: updatedPaid, status },
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "logIncomePayment");
    throw e;
  }
}
