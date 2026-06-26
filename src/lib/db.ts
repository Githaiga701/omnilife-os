import { PrismaClient } from "@prisma/client";

type DbClient = PrismaClient & {
  transaction: PrismaClient["transaction"];
  project: PrismaClient["project"];
  account: PrismaClient["account"];
  user: PrismaClient["user"];
};

const globalForPrisma = globalThis as unknown as {
  prisma: DbClient | undefined;
};

function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL ?? "";
  return Boolean(url && !url.includes("[YOUR-PASSWORD]"));
}

function createFallbackDb(): DbClient {
  return {
    user: {
      upsert: async () => ({ id: "local-user", email: "omnilife@local", name: "OmniLife User" }),
    },
    project: {
      findMany: async () => [],
      create: async () => null,
      update: async () => null,
    },
    account: {
      findFirst: async () => null,
      create: async () => null,
    },
    transaction: {
      findMany: async () => [],
      create: async () => null,
    },
  } as unknown as DbClient;
}

function createDbClient() {
  if (!isDatabaseConfigured()) {
    return createFallbackDb();
  }

  try {
    return new PrismaClient();
  } catch {
    return createFallbackDb();
  }
}

export const db = globalForPrisma.prisma ?? createDbClient();

if (process.env.NODE_ENV !== "production" && isDatabaseConfigured() && db instanceof PrismaClient) {
  globalForPrisma.prisma = db;
}
