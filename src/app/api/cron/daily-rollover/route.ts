import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isAuthorized(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const result = await db.bill.updateMany({
      where: {
        status: "UNPAID",
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const studySessions = await db.studySession.findMany({
      where: {
        startTime: { gte: todayStart, lt: todayEnd },
      },
    });

    const totalStudyMins = studySessions.reduce((sum: number, s) => sum + s.duration, 0);

    return NextResponse.json({
      success: true,
      billsMarkedOverdue: result.count,
      totalStudyMinutesToday: totalStudyMins,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Daily rollover failed:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
