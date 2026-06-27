import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

type DbClient = PrismaClient & {
  transaction: PrismaClient["transaction"];
  project: PrismaClient["project"];
  account: PrismaClient["account"];
  user: PrismaClient["user"];
};

type FindUniqueByIdArgs = { where?: { id?: string } };

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
      findFirst: async () => ({ id: "local-user", email: "omnilife@local", name: "OmniLife User" }),
      create: async () => ({ id: "local-user", email: "demo@omnilife.com", name: "OmniLife Demo User" }),
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
    learningPath: {
      findMany: async () => [],
      create: async () => ({ id: "local-path", userId: "local-user", title: "", units: [], createdAt: new Date() }),
    },
    unit: {
      update: async () => ({ id: "local-unit", learningPathId: "local-path", title: "", order: 1, completed: false, assignments: [] }),
    },
    journalEntry: {
      findMany: async () => [],
      create: async () => ({ id: "local-entry", userId: "local-user", content: "", date: new Date() }),
    },
    assignment: {
      findMany: async () => [],
      update: async () => ({ id: "local-assignment", unitId: "local-unit", title: "", status: "PENDING" }),
    },
    calendarEvent: {
      findMany: async () => [],
      create: async () => ({ id: "local-event", userId: "local-user", title: "", startTime: new Date(), endTime: new Date() }),
      findUnique: async ({ where }: FindUniqueByIdArgs) => where ? null : null,
      delete: async () => ({}),
    },
    skill: {
      findMany: async () => [],
      create: async () => ({ id: "local-skill", userId: "local-user", name: "", category: "", level: 0, targetLevel: 10 }),
      findUnique: async ({ where }: FindUniqueByIdArgs) => where ? null : null,
      update: async () => ({ id: "local-skill", userId: "local-user", name: "", category: "", level: 0, targetLevel: 10 }),
    },
    hobby: {
      findMany: async () => [],
      create: async () => ({ id: "local-hobby", userId: "local-user", name: "", cadence: "", progress: 0, createdAt: new Date() }),
      findUnique: async ({ where }: FindUniqueByIdArgs) => where ? null : null,
      update: async () => ({ id: "local-hobby", userId: "local-user", name: "", cadence: "", progress: 0, createdAt: new Date() }),
      delete: async () => ({}),
    },
    studySession: {
      findMany: async () => [],
      create: async () => ({ id: "local-session", userId: "local-user", subject: "Learning", duration: 0, notes: "", startTime: new Date(), endTime: new Date() }),
    },
    bill: {
      findMany: async () => [],
      create: async () => ({ id: "local-bill", userId: "local-user", title: "", amount: 0, dueDate: new Date(), status: "UNPAID", isRecurring: false, frequency: "ONE_TIME" }),
      update: async () => ({ id: "local-bill", userId: "local-user", title: "", amount: 0, dueDate: new Date(), status: "PAID", isRecurring: false, frequency: "ONE_TIME" }),
      updateMany: async () => ({ count: 0 }),
      findUnique: async ({ where }: FindUniqueByIdArgs) => ({ id: where?.id ?? "local-bill", userId: "local-user", title: "Mock Bill", amount: 100, dueDate: new Date(), status: "UNPAID", isRecurring: false, frequency: "ONE_TIME", transactionId: null, createdAt: new Date() }),
    },
    incomeEntry: {
      findMany: async () => [],
      create: async () => ({ id: "local-income", userId: "local-user", sourceName: "", totalAmount: 0, amountPaid: 0, status: "PENDING" }),
      update: async () => ({ id: "local-income", userId: "local-user", sourceName: "", totalAmount: 0, amountPaid: 0, status: "PAID" }),
    },
  } as unknown as DbClient;
}

function createDbClient() {
  if (!isDatabaseConfigured()) {
    return createFallbackDb();
  }

  try {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 12,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter }) as unknown as DbClient;
  } catch (error) {
    console.error("Failed to initialize PrismaClient with driver adapter:", error);
    return createFallbackDb();
  }
}

export const db = globalForPrisma.prisma ?? createDbClient();

if (process.env.NODE_ENV !== "production" && isDatabaseConfigured() && db instanceof PrismaClient) {
  globalForPrisma.prisma = db;
}
