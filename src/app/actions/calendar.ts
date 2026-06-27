"use server";

import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { CalendarEventSchema, SkillSchema, HobbySchema, safeParse } from "@/lib/validation";
import { revalidateAll, handleServerError } from "@/lib/server-utils";

export async function createCalendarEvent(formData: FormData) {
  try {
    const user = await getMockUser();
    const parsed = safeParse(CalendarEventSchema, {
      title: formData.get("title"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      location: formData.get("location"),
    });
    if (!parsed.success) throw new Error(parsed.error);

    await db.calendarEvent.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        startTime: new Date(parsed.data.startTime),
        endTime: new Date(parsed.data.endTime),
        location: parsed.data.location || null,
      },
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "createCalendarEvent");
    throw e;
  }
}

export async function deleteCalendarEvent(formData: FormData) {
  try {
    const user = await getMockUser();
    const id = formData.get("id") as string;
    if (!id) throw new Error("Event ID is required");

    const event = await db.calendarEvent.findUnique({ where: { id } });
    if (!event || event.userId !== user.id) throw new Error("Event not found or access denied");

    await db.calendarEvent.delete({ where: { id } });
    revalidateAll();
  } catch (e) {
    handleServerError(e, "deleteCalendarEvent");
    throw e;
  }
}

export async function createSkill(formData: FormData) {
  try {
    const user = await getMockUser();
    const parsed = safeParse(SkillSchema, {
      name: formData.get("name"),
      category: formData.get("category"),
      level: parseInt(formData.get("level") as string),
      targetLevel: parseInt(formData.get("targetLevel") as string),
    });
    if (!parsed.success) throw new Error(parsed.error);

    await db.skill.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        category: parsed.data.category,
        level: parsed.data.level,
        targetLevel: parsed.data.targetLevel,
      },
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "createSkill");
    throw e;
  }
}

export async function updateSkillLevel(formData: FormData) {
  try {
    const user = await getMockUser();
    const id = formData.get("id") as string;
    const level = parseInt(formData.get("level") as string);

    if (!id) throw new Error("Skill ID is required");
    if (isNaN(level) || level < 0) throw new Error("Invalid level");

    const skill = await db.skill.findUnique({ where: { id } });
    if (!skill || skill.userId !== user.id) throw new Error("Skill not found or access denied");

    await db.skill.update({ where: { id }, data: { level } });
    revalidateAll();
  } catch (e) {
    handleServerError(e, "updateSkillLevel");
    throw e;
  }
}

export async function createHobby(formData: FormData) {
  try {
    const user = await getMockUser();
    const parsed = safeParse(HobbySchema, {
      name: formData.get("name"),
      cadence: formData.get("cadence"),
      progress: parseInt(formData.get("progress") as string) || 0,
    });
    if (!parsed.success) throw new Error(parsed.error);

    await db.hobby.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        cadence: parsed.data.cadence || null,
        progress: parsed.data.progress,
      },
    });

    revalidateAll();
  } catch (e) {
    handleServerError(e, "createHobby");
    throw e;
  }
}

export async function updateHobbyProgress(formData: FormData) {
  try {
    const user = await getMockUser();
    const id = formData.get("id") as string;
    const progress = parseInt(formData.get("progress") as string);

    if (!id) throw new Error("Hobby ID is required");
    if (isNaN(progress) || progress < 0 || progress > 100) throw new Error("Invalid progress (0-100)");

    const hobby = await db.hobby.findUnique({ where: { id } });
    if (!hobby || hobby.userId !== user.id) throw new Error("Hobby not found or access denied");

    await db.hobby.update({ where: { id }, data: { progress } });
    revalidateAll();
  } catch (e) {
    handleServerError(e, "updateHobbyProgress");
    throw e;
  }
}

export async function deleteHobby(formData: FormData) {
  try {
    const user = await getMockUser();
    const id = formData.get("id") as string;
    if (!id) throw new Error("Hobby ID is required");

    const hobby = await db.hobby.findUnique({ where: { id } });
    if (!hobby || hobby.userId !== user.id) throw new Error("Hobby not found or access denied");

    await db.hobby.delete({ where: { id } });
    revalidateAll();
  } catch (e) {
    handleServerError(e, "deleteHobby");
    throw e;
  }
}
