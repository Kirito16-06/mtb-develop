import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, differenceInDays } from "date-fns";
import { ActivityType, StreakType } from "@prisma/client";
import { assignJp } from "@/lib/utils/jp";
import { checkRole } from "@/lib/utils/auth";

export async function GET(req: Request) {
  try {
    const session = await checkRole("USER");
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as StreakType;

    if (!type || !Object.values(StreakType).includes(type)) {
      return NextResponse.json({ error: "Invalid streak type" }, { status: 400 });
    }

    const streak = await prisma.streak.findUnique({
      where: { 
        userId_type: {
          userId: session.user.id,
          type: type
        }
      },
    });

    if (!streak) {
      return NextResponse.json({ count: 0, lastLogAt: null });
    }

    const count = type === StreakType.MIRACLE_LOG ? streak.miracle_log_count : streak.progress_vault_count;
    const lastLogAt = type === StreakType.MIRACLE_LOG ? streak.miracle_log_last_at : streak.progress_vault_last_at;

    return NextResponse.json({
      count,
      lastLogAt,
    });
  } catch (error) {
    console.error("[STREAK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await checkRole("USER");
    const { type } = await req.json();

    if (!type || !Object.values(StreakType).includes(type)) {
      return NextResponse.json({ error: "Invalid streak type" }, { status: 400 });
    }

    const today = startOfDay(new Date());
    
    // Get or create streak record
    let streak = await prisma.streak.findUnique({
      where: { 
        userId_type: {
          userId: session.user.id,
          type: type
        }
      },
    });

    if (!streak) {
      const createData = {
        user: { connect: { id: session.user.id } },
        type: type,
        ...(type === StreakType.MIRACLE_LOG
          ? { miracle_log_count: 1, miracle_log_last_at: today }
          : { progress_vault_count: 1, progress_vault_last_at: today }),
      };

      streak = await prisma.streak.create({
        data: createData,
      });

      // Create streak history entry
      await prisma.streakHistory.create({
        data: {
          user: { connect: { id: session.user.id } },
          type: type,
          count: 1,
          date: today,
        },
      });

      return NextResponse.json(streak);
    }

    const lastLogDate = startOfDay(new Date(
      type === StreakType.MIRACLE_LOG ? streak.miracle_log_last_at! : streak.progress_vault_last_at!
    ));
    const daysSinceLastLog = differenceInDays(today, lastLogDate);

    // If more than 1 day has passed, reset streak to 0
    if (daysSinceLastLog > 1) {
      const updateData = type === StreakType.MIRACLE_LOG
        ? { miracle_log_count: 0, miracle_log_last_at: null }
        : { progress_vault_count: 0, progress_vault_last_at: null };

      streak = await prisma.streak.update({
        where: { 
          userId_type: {
            userId: session.user.id,
            type: type
          }
        },
        data: updateData,
      });

      // Create streak history entry for reset
      await prisma.streakHistory.create({
        data: {
          user: { connect: { id: session.user.id } },
          type: type,
          count: 0,
          date: today,
        },
      });

      return NextResponse.json(streak);
    }

    // If already logged today, return current streak
    if (daysSinceLastLog === 0) {
      return NextResponse.json(streak);
    }

    // If streak is 0, start at 1
    let newStreak = (type === StreakType.MIRACLE_LOG ? streak.miracle_log_count : streak.progress_vault_count);
    if (newStreak === 0) {
      newStreak = 1;
    } else {
      newStreak = newStreak + 1;
    }

    const updateData = type === StreakType.MIRACLE_LOG
      ? { miracle_log_count: newStreak, miracle_log_last_at: today }
      : { progress_vault_count: newStreak, progress_vault_last_at: today };

    streak = await prisma.streak.update({
      where: { 
        userId_type: {
          userId: session.user.id,
          type: type
        }
      },
      data: updateData,
    });

    // Create streak history entry
    await prisma.streakHistory.create({
      data: {
        user: { connect: { id: session.user.id } },
        type: type,
        count: newStreak,
        date: today,
      },
    });

    // Check for streak rewards
    let rewardActivity: ActivityType | null = null;
    if (type === StreakType.MIRACLE_LOG) {
      if (newStreak === 7) {
        rewardActivity = ActivityType.MIRACLE_STREAK_REWARD_7_DAYS;
      } else if (newStreak === 21) {
        rewardActivity = ActivityType.MIRACLE_STREAK_REWARD_21_DAYS;
      } else if (newStreak === 45) {
        rewardActivity = ActivityType.MIRACLE_STREAK_REWARD_45_DAYS;
      } else if (newStreak === 90) {
        rewardActivity = ActivityType.MIRACLE_STREAK_REWARD_90_DAYS;
      }
    } else if (type === StreakType.PROGRESS_VAULT) {
      if (newStreak === 7) {
        rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_7_DAYS;
      } else if (newStreak === 21) {
        rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_21_DAYS;
      } else if (newStreak === 45) {
        rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_45_DAYS;
      } else if (newStreak === 90) {
        rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_90_DAYS;
      }
    }

    // Only award JP for milestones if streak <= 90
    if (rewardActivity && newStreak <= 90) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { plan: true },
      });

      if (user) {
        await assignJp(user, rewardActivity);
      }
    }

    return NextResponse.json(streak);
  } catch (error) {
    console.error("[STREAK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 