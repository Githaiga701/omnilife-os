"use server";

import { getMockUser } from "@/lib/mock-auth";
import { BillSchema, IncomeEntrySchema, safeParse } from "@/lib/validation";
import { revalidateAll, handleServerError } from "@/lib/server-utils";
import {
  createBillForUser,
  createIncomeEntryForUser,
  logIncomePaymentForUser,
  markBillPaidForUser,
} from "@/lib/finance-service";

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

    await createBillForUser({
      userId: user.id,
      name,
      amount,
      dueDate,
      isRecurring,
      frequency,
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

    await createIncomeEntryForUser({
      userId: user.id,
      sourceName,
      totalAmount,
      dueDate,
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

    const createTransaction = formData.get("createTransaction") === "on";

    await markBillPaidForUser({
      userId: user.id,
      billId,
      createTransaction,
      ensureAccountForTransaction: true,
    });

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

    await logIncomePaymentForUser({
      userId: user.id,
      incomeId,
      amount: newPayment,
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "logIncomePayment");
    throw e;
  }
}
