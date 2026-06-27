import { z } from "zod";

const dateString = z.string().refine((v) => !isNaN(new Date(v).getTime()), {
  message: "Invalid date string",
});

export const BillSchema = z.object({
  name: z.string().min(1, "Bill name is required").max(200),
  amount: z.number().positive("Amount must be positive").finite(),
  dueDate: z.union([z.date(), dateString]).transform((v) => new Date(v)),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(["ONE_TIME", "WEEKLY", "MONTHLY", "YEARLY"]).default("ONE_TIME"),
});

export const IncomeEntrySchema = z.object({
  sourceName: z.string().min(1, "Source name is required").max(200),
  totalAmount: z.number().positive("Total amount must be positive").finite(),
  dueDate: z.union([z.date(), dateString]).transform((v) => new Date(v)),
});

export const PaymentSchema = z.object({
  incomeId: z.string().min(1),
  amount: z.number().positive("Payment amount must be positive").finite(),
});

export const LearningPathSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
});

export const JournalEntrySchema = z.object({
  content: z.string().min(1, "Content is required").max(10000),
});

export const StudySessionSchema = z.object({
  durationMins: z.number().int().positive("Duration must be positive").max(1440),
  notes: z.string().max(5000).optional().default(""),
  subject: z.string().min(1, "Subject is required").max(200),
});

export const AssignmentStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);

export const CalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  startTime: dateString,
  endTime: dateString,
  location: z.string().max(200).optional().default(""),
});

export const SkillSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.string().min(1, "Category is required").max(100),
  level: z.number().int().min(0).max(100).default(0),
  targetLevel: z.number().int().min(1).max(100).default(10),
});

export const HobbySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  cadence: z.string().max(200).optional().default(""),
  progress: z.number().int().min(0).max(100).default(0),
});

export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") };
}
