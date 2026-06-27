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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const billsDueToday = await db.bill.findMany({
      where: {
        status: { not: "PAID" },
        dueDate: { gte: todayStart, lt: todayEnd },
      },
    });

    const assignmentsDueToday = await db.assignment.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { gte: todayStart, lt: todayEnd },
      },
      include: { unit: { include: { learningPath: true } } },
    });

    const overdueBills = await db.bill.findMany({
      where: { status: "OVERDUE" },
    });

    const totalBillsDue = billsDueToday.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0);

    return NextResponse.json({
      success: true,
      date: todayStart.toISOString().split("T")[0],
      summary: {
        billsDueToday: billsDueToday.length,
        billsDueTotal: totalBillsDue,
        assignmentsDueToday: assignmentsDueToday.length,
        assignmentsDetail: assignmentsDueToday.map(a => ({
          title: a.title,
          course: a.unit.learningPath.title,
        })),
        overdueBills: overdueBills.length,
        overdueAmount: overdueBills.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0),
      },
    });
  } catch (error) {
    console.error("Morning briefing failed:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
