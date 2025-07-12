import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { assignJp } from "@/lib/utils/jp";
import { ActivityType, StreakType } from "@prisma/client";
import { checkRole } from "@/lib/utils/auth";
import { startOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await checkRole("USER");

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch only logs that haven't been soft-deleted
    const logs = await prisma.progressVault.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null, // Filter out soft-deleted logs
      },
      orderBy: { createdAt: 'desc' }, // Optional: sort by creation date
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await checkRole("USER");

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ message: "Valid content is required" }, { status: 400 });
    }

    const today = startOfDay(new Date());
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Count active (non-deleted) logs for today
    const activeLogsToday = await prisma.progressVault.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today,
          lte: endOfDay
        },
        deletedAt: null // Only count non-deleted logs
      }
    });

    if (activeLogsToday >= 3) {
      return NextResponse.json(
        { error: "Daily limit of 3 entries reached. You cannot add more entries today." },
        { status: 400 }
      );
    }

    // Create a new log
    const log = await prisma.progressVault.create({
      data: {
        content,
        userId: session.user.id,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true },
    });

    if (user) {
      try {
        // Get all logs from today that have JP points assigned (including deleted ones)
        const logsWithJpToday = await prisma.progressVault.findMany({
          where: {
            userId: session.user.id,
            createdAt: {
              gte: today,
              lte: endOfDay
            },
            jpPointsAssigned: true,
          },
        });

        // If user has already received JP points for 3 logs today (even if some were deleted),
        // they cannot receive more JP points
        if (logsWithJpToday.length >= 3) {
          return NextResponse.json({
            log,
            warning: "You have already received JP points for 3 logs today. No additional JP points will be awarded.",
          });
        }

        // Award JP points and mark the log
        await assignJp(user, ActivityType.PROGRESS_VAULT);
        await prisma.progressVault.update({
          where: { id: log.id },
          data: { jpPointsAssigned: true },
        });

        // Handle streak - only increment if this is the first log of the day
        if (activeLogsToday === 1) {
          const streak = await prisma.streak.findUnique({
            where: {
              userId_type: {
                userId: session.user.id,
                type: StreakType.PROGRESS_VAULT
              }
            },
          });

          if (!streak) {
            // Create new streak
            await prisma.streak.create({
              data: {
                user: { connect: { id: session.user.id } },
                type: StreakType.PROGRESS_VAULT,
                progress_vault_count: 1,
                progress_vault_last_at: today,
              },
            });

            // Create streak history entry
            await prisma.streakHistory.create({
              data: {
                user: { connect: { id: session.user.id } },
                type: StreakType.PROGRESS_VAULT,
                count: 1,
                date: today,
              },
            });
          } else {
            const lastLogDate = startOfDay(new Date(streak.progress_vault_last_at!));
            const daysSinceLastLog = Math.floor((today.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceLastLog > 1) {
              // Reset streak if more than 1 day has passed
              await prisma.streak.update({
                where: {
                  userId_type: {
                    userId: session.user.id,
                    type: StreakType.PROGRESS_VAULT
                  }
                },
                data: {
                  progress_vault_count: 1,
                  progress_vault_last_at: today,
                },
              });

              // Create streak history entry for reset
              await prisma.streakHistory.create({
                data: {
                  user: { connect: { id: session.user.id } },
                  type: StreakType.PROGRESS_VAULT,
                  count: 1,
                  date: today,
                },
              });
            } else if (daysSinceLastLog === 1) {
              // Increment streak if exactly 1 day has passed
              const newStreak = streak.progress_vault_count + 1;
              await prisma.streak.update({
                where: {
                  userId_type: {
                    userId: session.user.id,
                    type: StreakType.PROGRESS_VAULT
                  }
                },
                data: {
                  progress_vault_count: newStreak,
                  progress_vault_last_at: today,
                },
              });

              // Create streak history entry
              await prisma.streakHistory.create({
                data: {
                  user: { connect: { id: session.user.id } },
                  type: StreakType.PROGRESS_VAULT,
                  count: newStreak,
                  date: today,
                },
              });

              // Check for streak rewards
              let rewardActivity: ActivityType | null = null;
              if (newStreak === 7) {
                rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_7_DAYS;
              } else if (newStreak === 21) {
                rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_21_DAYS;
              } else if (newStreak === 45) {
                rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_45_DAYS;
              } else if (newStreak === 90) {
                rewardActivity = ActivityType.PROGRESS_VAULT_STREAK_REWARD_90_DAYS;
              }

              if (rewardActivity) {
                await assignJp(user, rewardActivity);
              }
            }
          }
        }
      } catch (error) {
        // If the error is about daily JP limit, we still want to return the log
        if (error instanceof Error && error.message.includes("Daily JP limit")) {
          console.log("Daily JP limit reached, but log was created");
          return NextResponse.json({
            log,
            warning: "Progress Vault created, but you've reached the daily JP limit of 150",
          });
        } else {
          // For other errors, rethrow
          throw error;
        }
      }
    }

    return NextResponse.json({
      message: "Log created successfully",
      log,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}
