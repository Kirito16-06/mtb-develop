import { NextResponse } from "next/server";
import { checkRole } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

type HourlyMetrics = {
  hour: string;
  views: number;
  clicks: number;
};

export async function GET() {
  try {
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );

    const profileViews = await prisma.profileView.count({
      where: {
        userId: session.user.id,
      },
    });

    // LOGIN ACTIVITY (Past 30 Days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const loginActivity = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        activity: { activity: "DAILY_LOGIN" },
        createdAt: {
          gte: startOfDay(thirtyDaysAgo),
          lte: endOfDay(new Date()),
        },
      },
      orderBy: { createdAt: "asc" },
      include: { activity: true },
    });

    // Build daily counts (31 days)
    const loginsByDay = new Array(31).fill(0);
    loginActivity.forEach((login) => {
      const diffDays = Math.floor(
        (new Date().getTime() - new Date(login.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const dayIndex = 30 - diffDays;
      if (dayIndex >= 0 && dayIndex < 31) {
        loginsByDay[dayIndex]++;
      }
    });

    const dates = Array.from({ length: 31 }, (_, i) => {
      const d = subDays(new Date(), 30 - i);
      return d.toISOString().split("T")[0];
    });

    //  ACTIVE SPOTLIGHT (Today Only)

    const activeSpotlight = await prisma.spotlight.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: { activities: true },
    });
    let hourlyMetrics: HourlyMetrics[] = [];
    if (activeSpotlight) {
      // Filter activities from today, then group by hour
      const todayActivities = activeSpotlight.activities.filter(
        (activity) => new Date(activity.createdAt) >= startOfDay(new Date())
      );

      // Initialize an array for 24 hours
      hourlyMetrics = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        views: 0,
        clicks: 0,
      }));

      // Aggregate the counts by hour
      todayActivities.forEach((activity) => {
        const activityDate = new Date(activity.createdAt);
        const hour = activityDate.getHours(); // returns 0-23
        if (activity.type === "VIEW") {
          hourlyMetrics[hour].views++;
        } else if (activity.type === "CONNECT") {
          hourlyMetrics[hour].clicks++;
        }
      });
    }

    const activeSpotlightData = activeSpotlight
      ? {
          id: activeSpotlight.id,
          views: activeSpotlight.activities.filter((a) => a.type === "VIEW")
            .length,
          clicks: activeSpotlight.activities.filter((a) => a.type === "CONNECT")
            .length,
        }
      : null;

    //  PREVIOUS SPOTLIGHT HISTORY
    const previousSpotlights = await prisma.spotlight.findMany({
      where: {
        userId: session.user.id,
        appliedAt: { lt: startOfDay(new Date()) },
        status: "EXPIRED",
      },
      include: { activities: true },
      orderBy: { appliedAt: "desc" },
    });

    const previousSpotlightHistory = previousSpotlights.map((s) => ({
      applicationDate: s.appliedAt,
      activatedDate: s.activatedAt,
      views: s.activities.filter((a) => a.type === "VIEW").length,
      clicks: s.activities.filter((a) => a.type === "CONNECT").length,
    }));

    return NextResponse.json({
      dailyActivity: { dates, logins: loginsByDay },
      spotlight: {
        active: activeSpotlightData,
        hourlyMetrics: hourlyMetrics,
        history: previousSpotlightHistory,
      },
      profileViews,
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
