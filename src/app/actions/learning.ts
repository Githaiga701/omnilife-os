"use server";

import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { LearningPathSchema, JournalEntrySchema, StudySessionSchema, AssignmentStatusSchema, safeParse } from "@/lib/validation";
import { revalidateAll, handleServerError } from "@/lib/server-utils";

async function verifyPathOwnership(pathId: string, userId: string) {
  const path = await db.learningPath.findUnique({ where: { id: pathId } });
  if (!path || path.userId !== userId) {
    throw new Error("Learning path not found or access denied");
  }
  return path;
}

async function verifyUnitOwnership(unitId: string, userId: string) {
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    include: { learningPath: true },
  });
  if (!unit || unit.learningPath.userId !== userId) {
    throw new Error("Unit not found or access denied");
  }
  return unit;
}

async function verifyAssignmentOwnership(assignmentId: string, userId: string) {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { unit: { include: { learningPath: true } } },
  });
  if (!assignment || assignment.unit.learningPath.userId !== userId) {
    throw new Error("Assignment not found or access denied");
  }
  return assignment;
}

export async function createLearningPath(formData: FormData) {
  try {
    const user = await getMockUser();
    const parsed = safeParse(LearningPathSchema, {
      title: formData.get("title"),
    });
    if (!parsed.success) throw new Error(parsed.error);

    await db.learningPath.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        units: {
          create: [
            { title: "Unit 1: Introduction", order: 1 },
            { title: "Unit 2: Core Concepts", order: 2 },
          ],
        },
      },
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "createLearningPath");
    throw e;
  }
}

export async function updateUnitProgress(unitId: string, completed: boolean) {
  try {
    const user = await getMockUser();
    await verifyUnitOwnership(unitId, user.id);

    await db.unit.update({
      where: { id: unitId },
      data: { completed },
    });
    revalidateAll();
    return { success: true as const };
  } catch (e) {
    return handleServerError(e, "updateUnitProgress");
  }
}

export async function toggleAssignment(assignmentId: string, status: string) {
  try {
    const user = await getMockUser();
    await verifyAssignmentOwnership(assignmentId, user.id);

    const parsed = AssignmentStatusSchema.safeParse(status);
    if (!parsed.success) throw new Error("Invalid status. Must be PENDING, IN_PROGRESS, or DONE");

    await db.assignment.update({
      where: { id: assignmentId },
      data: { status: parsed.data },
    });
    revalidateAll();
  } catch (e) {
    handleServerError(e, "toggleAssignment");
    throw e;
  }
}

export async function addJournalEntry(learningPathId: string, formData: FormData) {
  try {
    const user = await getMockUser();
    await verifyPathOwnership(learningPathId, user.id);

    const parsed = safeParse(JournalEntrySchema, {
      content: formData.get("content"),
    });
    if (!parsed.success) throw new Error(parsed.error);

    await db.journalEntry.create({
      data: { userId: user.id, content: parsed.data.content },
    });
    revalidateAll();
  } catch (e) {
    handleServerError(e, "addJournalEntry");
    throw e;
  }
}

export async function logStudySession(learningPathId: string, durationMins: number, notes: string, subject: string) {
  try {
    const user = await getMockUser();
    await verifyPathOwnership(learningPathId, user.id);

    const parsed = safeParse(StudySessionSchema, { durationMins, notes, subject });
    if (!parsed.success) throw new Error(parsed.error);

    await db.studySession.create({
      data: {
        userId: user.id,
        subject: parsed.data.subject,
        duration: parsed.data.durationMins,
        notes: parsed.data.notes || null,
        startTime: new Date(),
        endTime: new Date(),
      },
    });
    revalidateAll();
    return { success: true as const };
  } catch (e) {
    return handleServerError(e, "logStudySession");
  }
}
