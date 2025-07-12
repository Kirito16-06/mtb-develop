import { checkRole } from "@/lib/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignJp } from "@/lib/utils/jp";
import { ActivityType, Prisma } from "@prisma/client";
import { DailyBloomFormType } from "@/schema/zodSchema";

const nextDate = (
  startDate: Date,
  frequency: "Daily" | "Weekly" | "Monthly"
): Date => {
  const nextDate = new Date(startDate);

  nextDate.setHours(0, 0, 0, 0);

  if (frequency === "Daily") {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (frequency === "Weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (frequency === "Monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate;
};

export async function GET(request: NextRequest) {
  try {
    const session = await checkRole("USER");

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const completedRecurringTasks = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true,
        frequency: {
          in: ["Daily", "Weekly", "Monthly"],
        },
      },
    });

    const updatePromises = [];

    for (const task of completedRecurringTasks) {
      if (task.frequency) {
        const newDate = nextDate(
          task.updatedAt,
          task.frequency as "Daily" | "Weekly" | "Monthly"
        );

        if (newDate <= now) {
          updatePromises.push(
            prisma.todo.update({
              where: { id: task.id },
              data: {
                isCompleted: false,
                dueDate: newDate,
              },
            })
          );
        }
      }
    }

    if (updatePromises.length > 0) {
      await prisma.$transaction(updatePromises);
    }

    const { searchParams } = request.nextUrl;
    const frequency = searchParams.get("frequency");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const skip = (page - 1) * limit;

    const whereClause: Prisma.TodoWhereInput = {
      userId: session.user.id,
    };

    // ✅ THIS IS THE CORRECTED LOGIC
    if (status === "Pending") {
      whereClause.isCompleted = false;
      // A task is "Pending" (and not overdue) if it's not complete AND either:
      // 1. It has no due date (e.g., a frequency-based task).
      // 2. Its due date is today or in the future.
      // This correctly excludes tasks whose due date is in the past.
      whereClause.OR = [
        { dueDate: null },
        { dueDate: { gte: now } },
      ];
    } else if (status === "Completed") {
      whereClause.isCompleted = true;
    }

    if (frequency && frequency !== "All") {
      whereClause.frequency = frequency as "Daily" | "Weekly" | "Monthly";
    }

    const [blooms, totalCount] = await prisma.$transaction([
      prisma.todo.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
      }),
      prisma.todo.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      data: blooms,
      totalCount: totalCount,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Failed to fetch blooms" },
      { status: 500 }
    );
  }
}

// The POST function remains completely unchanged.
export async function POST(req: NextRequest) {
  try {
    const session = await checkRole("USER");

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requestBody: DailyBloomFormType = await req.json();
    const {
      title,
      description,
      frequency,
      dueDate,
      isCompleted,
      taskAddJP,
      taskCompleteJP,
    } = requestBody;

    const newBloom = await prisma.todo.create({
      data: {
        title,
        description,
        frequency: frequency,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted: isCompleted ?? false,
        taskAddJP: taskAddJP ?? false,
        taskCompleteJP: taskCompleteJP ?? false,
        userId: session.user.id,
      },
    });

    if (!newBloom) {
      return NextResponse.json(
        { error: "Error while creating a Daily Bloom", success: false },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true },
    });

    if (user) {
      try {
        await assignJp(user, ActivityType.DAILY_BLOOM_CREATION_REWARD);
        await prisma.todo.update({
          where: { id: newBloom.id },
          data: { taskAddJP: true },
        });
      } catch (error) {
        console.error(`Error while assigning JP when daily bloom is created:`, error);
      }
    }

    return NextResponse.json({
      message: "Daily Bloom created successfully",
      newBloom,
    });
  } catch (err: unknown) {
    console.error("Error creating Todo:", err);

    const errorMessage =
      typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
        ? err.message
        : "Unknown error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
