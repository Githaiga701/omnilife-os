import { db } from "@/lib/db";
import { ensurePrimaryAccount, findPrimaryAccount } from "@/lib/accounts";

type BillFrequency = "ONE_TIME" | "WEEKLY" | "MONTHLY" | "YEARLY";

type CreateBillInput = {
  userId: string;
  name: string;
  amount: number;
  dueDate: Date;
  isRecurring: boolean;
  frequency: BillFrequency;
};

type CreateIncomeInput = {
  userId: string;
  sourceName: string;
  totalAmount: number;
  dueDate: Date;
};

type MarkBillPaidInput = {
  userId: string;
  billId: string;
  createTransaction: boolean;
  ensureAccountForTransaction?: boolean;
};

type LogIncomePaymentInput = {
  userId: string;
  incomeId: string;
  amount: number;
};

export async function verifyBillOwnership(billId: string, userId: string) {
  const bill = await db.bill.findUnique({ where: { id: billId } });
  if (!bill || bill.userId !== userId) {
    throw new Error("Bill not found or access denied");
  }
  return bill;
}

export async function verifyIncomeOwnership(incomeId: string, userId: string) {
  const income = await db.incomeEntry.findUnique({ where: { id: incomeId } });
  if (!income || income.userId !== userId) {
    throw new Error("Income entry not found or access denied");
  }
  return income;
}

export async function createBillForUser(input: CreateBillInput) {
  return db.bill.create({
    data: {
      userId: input.userId,
      title: input.name,
      amount: input.amount,
      dueDate: input.dueDate,
      isRecurring: input.isRecurring,
      frequency: input.frequency,
      status: "UNPAID",
    },
  });
}

export async function createIncomeEntryForUser(input: CreateIncomeInput) {
  return db.incomeEntry.create({
    data: {
      userId: input.userId,
      sourceName: input.sourceName,
      totalAmount: input.totalAmount,
      dueDate: input.dueDate,
      status: "PENDING",
      amountPaid: 0,
    },
  });
}

export async function markBillPaidForUser(input: MarkBillPaidInput) {
  const bill = await verifyBillOwnership(input.billId, input.userId);

  await db.bill.update({
    where: { id: input.billId },
    data: { status: "PAID" },
  });

  if (!input.createTransaction) {
    return { bill, transaction: null };
  }

  const account = input.ensureAccountForTransaction
    ? await ensurePrimaryAccount(input.userId)
    : await findPrimaryAccount(input.userId);

  if (!account) {
    return { bill, transaction: null };
  }

  const transaction = await db.transaction.create({
    data: {
      accountId: account.id,
      userId: input.userId,
      amount: -bill.amount,
      description: `Paid: ${bill.title}`,
      category: "Bills",
    },
  });

  await db.bill.update({
    where: { id: input.billId },
    data: { transactionId: transaction.id },
  });

  return { bill, transaction };
}

export async function logIncomePaymentForUser(input: LogIncomePaymentInput) {
  const income = await verifyIncomeOwnership(input.incomeId, input.userId);
  const updatedPaid = income.amountPaid + input.amount;

  if (updatedPaid > income.totalAmount) {
    throw new Error("Total payment exceeds expected amount");
  }

  const status = updatedPaid >= income.totalAmount ? "PAID" : "PARTIAL";

  await db.incomeEntry.update({
    where: { id: input.incomeId },
    data: { amountPaid: updatedPaid, status },
  });

  return { income, amountPaid: updatedPaid, status };
}
