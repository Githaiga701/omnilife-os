"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

async function ensureDefaultUser() {
  const email = process.env.OMNILIFE_DEFAULT_EMAIL ?? "omnilife@local";

  return db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "OmniLife User",
    },
  });
}

async function ensureDefaultAccount(userId: string) {
  const existing = await db.account.findFirst({
    where: { userId, name: "Primary Account" },
  });

  if (existing) {
    return existing;
  }

  return db.account.create({
    data: {
      userId,
      name: "Primary Account",
      type: "CHECKING",
      balance: 0,
    },
  });
}

export async function createProject(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!title) {
    return;
  }

  const user = await ensureDefaultUser();

  await db.project.create({
    data: {
      userId: user.id,
      title,
      description: description || null,
      status,
    },
  });

  revalidatePath("/projects");
}

export async function updateProjectStatus(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE");

  if (!projectId) {
    return;
  }

  await db.project.update({
    where: { id: projectId },
    data: { status },
  });

  revalidatePath("/projects");
}

export async function createTransaction(formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim();
  const type = String(formData.get("type") ?? "expense");
  const amountInput = Number(formData.get("amount") ?? 0);
  const isPending = String(formData.get("isPending") ?? "false") === "on";

  if (!description || Number.isNaN(amountInput) || amountInput <= 0) {
    return;
  }

  const user = await ensureDefaultUser();
  const account = await ensureDefaultAccount(user.id);
  const amount = type === "income" ? Math.abs(amountInput) : -Math.abs(amountInput);

  await db.transaction.create({
    data: {
      accountId: account.id,
      userId: user.id,
      amount,
      description,
      category: category || "General",
      isPending,
    },
  });

  revalidatePath("/finances");
}
