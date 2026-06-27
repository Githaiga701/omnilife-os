import { db } from "@/lib/db";

export const PRIMARY_ACCOUNT_NAME = "Primary Account";

export async function findPrimaryAccount(userId: string) {
  return db.account.findFirst({
    where: { userId, name: PRIMARY_ACCOUNT_NAME },
  });
}

export async function ensurePrimaryAccount(userId: string) {
  const existing = await findPrimaryAccount(userId);
  if (existing) return existing;

  return db.account.create({
    data: {
      userId,
      name: PRIMARY_ACCOUNT_NAME,
      type: "CHECKING",
      balance: 0,
    },
  });
}
