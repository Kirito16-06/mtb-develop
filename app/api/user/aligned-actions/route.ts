import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

// Note: We're using a CRON job at /api/cron/aligned-actions-reminders
// to handle sending emails before actions start, which is more reliable
// across server restarts than in-memory job scheduling

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log("userId", userId);
    const body = await req.json();
    console.log("body", body);
    
    // Add userId to body for validation
    // const dataToValidate = {
    //   ...body,
    //   userId,
    // };
    
    // Validate the request body against the schema
    // const validationResult = AlignedActionSchema.safeParse(dataToValidate);
    // console.log("result", validationResult);
    // if (!validationResult.success) {
    //   return NextResponse.json(
    //     { error: "Invalid request data", details: validationResult.error.format() },
    //     { status: 400 }
    //   );
    // }
    
    const data = body;
    
    
    // Check if user already has an aligned action for today
    const today = new Date();
    const existingAction = await prisma.alignedAction.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });
    
    if (existingAction) {
      return NextResponse.json(
        { error: "You already created an aligned action for today" },
        { status: 409 }
      );
    }
    
    // Create the aligned action
    const alignedAction = await prisma.alignedAction.create({
      data: {
        userId,
        mood: data.mood,
        tasks: data.tasks,
        selectedTask: data.selectedTask,
        category: data.category,
        timeFrom: data.timeFrom,
        timeTo: data.timeTo,
        reminderSent: false,
      },
    });
    
    return NextResponse.json(alignedAction, { status: 201 });
  } catch (error) {
    console.error("Error creating 1% Start action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    
    let dateFilter = {};
    
    if (date) {
      const queryDate = new Date(date);
      dateFilter = {
        createdAt: {
          gte: startOfDay(queryDate),
          lte: endOfDay(queryDate),
        },
      };
    }
    
    const alignedActions = await prisma.alignedAction.findMany({
      where: {
        userId,
        ...dateFilter,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(alignedActions);
  } catch (error) {
    console.error("Error fetching 1% Start actions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 