"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { handleServerError } from "@/lib/server-utils";

async function ensureDefaultUser() {
  const user = await getMockUser();
  if (user.id === "local-user") {
    return db.user.create({
      data: { email: "demo@omnilife.com", name: "OmniLife Demo User" },
    });
  }

  // Migrate any records orphaned under a duplicate user from the old
  // ensureDefaultUser implementation that used OMNILIFE_DEFAULT_EMAIL.
  const orphans = await db.user.findMany({
    where: { id: { not: user.id } },
  });
  for (const orphan of orphans) {
    await db.project.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.bill.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.incomeEntry.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.calendarEvent.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.learningPath.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.studySession.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.journalEntry.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.transaction.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.account.updateMany({ where: { userId: orphan.id }, data: { userId: user.id } });
    await db.user.delete({ where: { id: orphan.id } });
  }

  return user;
}

async function ensureDefaultAccount(userId: string) {
  const existing = await db.account.findFirst({
    where: { userId, name: "Primary Account" },
  });

  if (existing) return existing;

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
  try {
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const status = String(formData.get("status") ?? "ACTIVE");

    if (!title) throw new Error("Project title is required");
    if (title.length > 200) throw new Error("Title too long (max 200 chars)");

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
    revalidatePath("/");
  } catch (e) {
    handleServerError(e, "createProject");
    throw e;
  }
}

export async function updateProjectStatus(formData: FormData) {
  try {
    const projectId = String(formData.get("projectId") ?? "").trim();
    const status = String(formData.get("status") ?? "ACTIVE");

    if (!projectId) throw new Error("Project ID is required");

    const validStatuses = ["ACTIVE", "PAUSED", "COMPLETED"];
    if (!validStatuses.includes(status)) throw new Error("Invalid status");

    const user = await ensureDefaultUser();
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== user.id) throw new Error("Project not found or access denied");

    await db.project.update({
      where: { id: projectId },
      data: { status },
    });

    revalidatePath("/projects");
    revalidatePath("/");
  } catch (e) {
    handleServerError(e, "updateProjectStatus");
    throw e;
  }
}

export async function createTransaction(formData: FormData) {
  try {
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "General").trim();
    const type = String(formData.get("type") ?? "expense");
    const amountInput = Number(formData.get("amount") ?? 0);
    const isPending = String(formData.get("isPending") ?? "false") === "on";

    if (!description) return { error: "Description is required" };
    if (Number.isNaN(amountInput) || amountInput <= 0) return { error: "Invalid amount" };

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
    return { success: true };
  } catch (e) {
    return handleServerError(e, "createTransaction");
  }
}
