import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import type { Assignment, Bill, IncomeEntry, LearningPath, Unit } from "@prisma/client";
import {
  createBillForUser,
  createIncomeEntryForUser,
  logIncomePaymentForUser,
  markBillPaidForUser,
} from "@/lib/finance-service";

type UnitWithAssignments = Unit & { assignments: Assignment[] };
type LearningPathWithUnits = LearningPath & { units: UnitWithAssignments[] };

async function getUserId() {
  const user = await getMockUser();
  return user.id;
}

async function getUserIdWithFallback(): Promise<string> {
  try {
    return await getUserId();
  } catch {
    return "local-user";
  }
}

export const omniTools = {
  getLearningPaths: tool({
    description: "Retrieve all active learning paths, their units, progress, and assignments for the current user. Use this before making any learning-related changes.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const userId = await getUserIdWithFallback();
        const paths = (await db.learningPath.findMany({
          where: { userId },
          include: {
            units: {
              orderBy: { order: "asc" },
              include: { assignments: true },
            },
          },
        })) as LearningPathWithUnits[];
        return paths.map(p => ({
          id: p.id,
          title: p.title,
          units: p.units.map(u => ({
            id: u.id,
            title: u.title,
            completed: u.completed,
            assignments: u.assignments.map(a => ({ id: a.id, title: a.title, dueDate: a.dueDate, status: a.status })),
          })),
        }));
      } catch (e) {
        return { error: `Failed to fetch learning paths: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  getBills: tool({
    description: "Retrieve all bills (payables) for the current user, including unpaid, overdue, and paid bills. Bills past due with UNPAID status are shown as OVERDUE. Use this before making any finance-related changes.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const userId = await getUserIdWithFallback();
        const bills = (await db.bill.findMany({
          where: { userId },
          orderBy: { dueDate: "asc" },
        })) as Bill[];
        return bills.map(b => ({
          id: b.id,
          name: b.title,
          amount: b.amount,
          status: b.status,
          dueDate: b.dueDate,
          isRecurring: b.isRecurring,
        }));
      } catch (e) {
        return { error: `Failed to fetch bills: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  getIncomeEntries: tool({
    description: "Retrieve all income entries (receivables) for the current user. Use this to see pending or partial payments.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const userId = await getUserIdWithFallback();
        const incomes = (await db.incomeEntry.findMany({
          where: { userId },
          orderBy: { dueDate: "asc" },
        })) as IncomeEntry[];
        return incomes.map(i => ({
          id: i.id,
          sourceName: i.sourceName,
          totalAmount: i.totalAmount,
          amountPaid: i.amountPaid,
          status: i.status,
          dueDate: i.dueDate,
        }));
      } catch (e) {
        return { error: `Failed to fetch income entries: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  logStudySession: tool({
    description: "Log a study session for a specific learning path. Use when the user mentions studying, spending time learning, or doing a pomodoro session.",
    inputSchema: z.object({
      learningPathId: z.string().describe("The ID of the learning path being studied"),
      durationMins: z.number().positive().max(1440).describe("Duration of the study session in minutes (max 1440)"),
      notes: z.string().max(5000).optional().describe("Optional notes about what was studied"),
    }),
    execute: async ({ learningPathId, durationMins, notes }) => {
      try {
        const userId = await getUserIdWithFallback();
        const path = await db.learningPath.findUnique({ where: { id: learningPathId } });
        if (!path || path.userId !== userId) {
          return { error: "Learning path not found or access denied" };
        }
        const session = await db.studySession.create({
          data: {
            userId,
            subject: path.title,
            duration: durationMins,
            notes: notes || null,
            startTime: new Date(),
            endTime: new Date(),
          },
        });
        return { success: true, message: `Logged ${durationMins} minutes of study time for ${path.title}.`, sessionId: session.id };
      } catch (e) {
        return { error: `Failed to log study session: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  toggleAssignment: tool({
    description: "Update assignment status. Supports PENDING, IN_PROGRESS, and DONE. Use when the user says they started, finished, or submitted an assignment.",
    inputSchema: z.object({
      assignmentId: z.string().describe("The ID of the assignment to update"),
      status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).describe("The new status: PENDING, IN_PROGRESS, or DONE"),
    }),
    execute: async ({ assignmentId, status }) => {
      try {
        const userId = await getUserIdWithFallback();
        const assignment = await db.assignment.findUnique({
          where: { id: assignmentId },
          include: { unit: { include: { learningPath: true } } },
        });
        if (!assignment || assignment.unit.learningPath.userId !== userId) {
          return { error: "Assignment not found or access denied" };
        }
        await db.assignment.update({
          where: { id: assignmentId },
          data: { status },
        });
        return { success: true, message: `Assignment set to ${status}.` };
      } catch (e) {
        return { error: `Failed to update assignment: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  updateUnitProgress: tool({
    description: "Update the progress (completed status) of a specific unit within a learning path.",
    inputSchema: z.object({
      unitId: z.string().describe("The ID of the unit to update"),
      completed: z.boolean().describe("Whether the unit is completed"),
    }),
    execute: async ({ unitId, completed }) => {
      try {
        const userId = await getUserIdWithFallback();
        const unit = await db.unit.findUnique({
          where: { id: unitId },
          include: { learningPath: true },
        });
        if (!unit || unit.learningPath.userId !== userId) {
          return { error: "Unit not found or access denied" };
        }
        await db.unit.update({
          where: { id: unitId },
          data: { completed },
        });
        return { success: true, message: `Unit updated to ${completed ? "completed" : "incomplete"}.` };
      } catch (e) {
        return { error: `Failed to update unit: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  addJournalEntry: tool({
    description: "Create a new journal entry for a learning path. Use when the user wants to reflect, log thoughts, or write about what they learned.",
    inputSchema: z.object({
      learningPathId: z.string().describe("The ID of the learning path"),
      content: z.string().min(1).max(10000).describe("The journal entry text"),
    }),
    execute: async ({ content }) => {
      try {
        const user = await getMockUser();
        await db.journalEntry.create({
          data: { userId: user.id, content },
        });
        return { success: true, message: "Journal entry saved." };
      } catch (e) {
        return { error: `Failed to save journal entry: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  createBill: tool({
    description: "Create a new bill or financial obligation. Use when the user mentions a new expense, bill, rent, subscription, or payment they owe.",
    inputSchema: z.object({
      name: z.string().min(1).max(200).describe("Name of the bill (e.g., 'Apartment Rent')"),
      amount: z.number().positive().finite().describe("Amount due in dollars"),
      dueDate: z.string().describe("Due date in ISO format (YYYY-MM-DD)"),
      isRecurring: z.boolean().optional().default(false).describe("Whether this bill repeats"),
      frequency: z.enum(["ONE_TIME", "WEEKLY", "MONTHLY", "YEARLY"]).optional().default("ONE_TIME"),
    }),
    execute: async ({ name, amount, dueDate, isRecurring, frequency }) => {
      try {
        const userId = await getUserIdWithFallback();
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return { error: "Invalid due date" };

        const bill = await createBillForUser({
          userId,
          name,
          amount,
          dueDate: due,
          isRecurring: isRecurring || false,
          frequency: frequency || "ONE_TIME",
        });
        return { success: true, message: `Bill '${name}' for $${amount} created.`, billId: bill.id };
      } catch (e) {
        return { error: `Failed to create bill: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  markBillAsPaid: tool({
    description: "Mark an existing bill as PAID. Optionally create a linked transaction in the ledger. Use when the user says they paid a bill.",
    inputSchema: z.object({
      billId: z.string().describe("The ID of the bill to mark as paid"),
      createTransaction: z.boolean().optional().default(true).describe("Whether to auto-create a ledger transaction for this payment"),
    }),
    execute: async ({ billId, createTransaction }) => {
      try {
        const userId = await getUserIdWithFallback();
        const { bill } = await markBillPaidForUser({
          userId,
          billId,
          createTransaction: createTransaction ?? true,
          ensureAccountForTransaction: false,
        });

        return { success: true, message: `Bill '${bill.title}' marked as PAID${createTransaction ? " and transaction logged" : ""}.` };
      } catch (e) {
        return { error: `Failed to mark bill as paid: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  createIncomeEntry: tool({
    description: "Create a new expected income entry (receivable). Use when the user mentions a new client, freelance job, salary, or money owed to them.",
    inputSchema: z.object({
      sourceName: z.string().min(1).max(200).describe("Source of income (e.g., 'Client A - Website')"),
      totalAmount: z.number().positive().finite().describe("Total expected amount in dollars"),
      dueDate: z.string().describe("Expected payment date in ISO format (YYYY-MM-DD)"),
    }),
    execute: async ({ sourceName, totalAmount, dueDate }) => {
      try {
        const userId = await getUserIdWithFallback();
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return { error: "Invalid due date" };

        const income = await createIncomeEntryForUser({
          userId,
          sourceName,
          totalAmount,
          dueDate: due,
        });
        return { success: true, message: `Income entry '${sourceName}' for $${totalAmount} created.`, incomeId: income.id };
      } catch (e) {
        return { error: `Failed to create income entry: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  logIncomePayment: tool({
    description: "Log a partial or full payment received for an income entry. Use when the user says they received money from a client or source.",
    inputSchema: z.object({
      incomeId: z.string().describe("The ID of the income entry"),
      amount: z.number().positive().finite().describe("The amount received in this payment"),
    }),
    execute: async ({ incomeId, amount }) => {
      try {
        const userId = await getUserIdWithFallback();
        const { income, amountPaid, status } = await logIncomePaymentForUser({
          userId,
          incomeId,
          amount,
        });

        return { success: true, message: `Logged $${amount} payment. Total paid: $${amountPaid}/${income.totalAmount}. Status: ${status}` };
      } catch (e) {
        return { error: `Failed to log payment: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  createProject: tool({
    description: "Create a new project. Use when the user mentions starting a new project, initiative, or body of work.",
    inputSchema: z.object({
      title: z.string().min(1).max(200).describe("The project title"),
      description: z.string().max(5000).optional().describe("Optional project description"),
    }),
    execute: async ({ title, description }) => {
      try {
        const userId = await getUserIdWithFallback();
        const project = await db.project.create({
          data: { userId, title, description: description || null },
        });
        return { success: true, message: `Project '${title}' created.`, projectId: project.id };
      } catch (e) {
        return { error: `Failed to create project: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),

  createCalendarEvent: tool({
    description: "Create a new calendar event. Use when the user mentions a meeting, appointment, deadline, or scheduled activity.",
    inputSchema: z.object({
      title: z.string().min(1).max(200).describe("Event title"),
      startTime: z.string().describe("Start time in ISO format"),
      endTime: z.string().describe("End time in ISO format"),
      location: z.string().max(200).optional().describe("Event location"),
    }),
    execute: async ({ title, startTime, endTime, location }) => {
      try {
        const userId = await getUserIdWithFallback();
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return { error: "Invalid date" };

        const event = await db.calendarEvent.create({
          data: {
            userId,
            title,
            startTime: start,
            endTime: end,
            location: location || null,
          },
        });
        return { success: true, message: `Calendar event '${title}' created.`, eventId: event.id };
      } catch (e) {
        return { error: `Failed to create event: ${e instanceof Error ? e.message : "Unknown error"}` };
      }
    },
  }),
};
