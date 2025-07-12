import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { assignJp } from "@/lib/utils/jp";
import { ActivityType } from "@prisma/client";
import { checkRole } from "@/lib/utils/auth";

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
    console.log(url);
    // Get current time
    const now = new Date();
    
    // Check if there's an ongoing action (current time is within the scheduled time window)
    const ongoingActions = await prisma.alignedAction.findMany({
      where: {
        userId,
        timeFrom: {
          lte: now,
        },
        timeTo: {
          gte: now,
        },
        completed: false,
      },
      orderBy: {
        timeFrom: "asc",
      },
    });
    
    if (ongoingActions.length > 0) {
      return NextResponse.json(ongoingActions[0]);
    }
    
    // If no ongoing actions, return scheduled future actions (needed for client timer setup)
    const futureActions = await prisma.alignedAction.findMany({
      where: {
        userId,
        timeFrom: {
          gt: now,
        },
        completed: false,
      },
      orderBy: {
        timeFrom: "asc",
      },
      take: 1,
    });
    
    if (futureActions.length > 0) {
      return NextResponse.json({
        ...futureActions[0],
        status: "future",
      });
    }
    
    return NextResponse.json({ status: "none" });
  } catch (error) {
    console.error("Error fetching 1% Start action reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint to mark an action as completed and award JP
export async function POST(req: NextRequest) {
  try {
    const session = checkRole("USER");
    const userId = (await session).user.id
    const body = await req.json();
    const { actionId, completed } = body;
    
    if (!actionId) {
      return NextResponse.json(
        { error: "Action ID is required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },include:{
        plan:true
      }
    });
    
    // Check if the action exists and belongs to the user
    const action = await prisma.alignedAction.findFirst({
      where: {
        id: actionId,
        userId,
      },
    });
    
    if (!action) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 404 }
      );
    }
    
    // Mark the action as completed
    const updatedAction = await prisma.alignedAction.update({
      where: {
        id: actionId,
      },
      data: {
        completed: completed ?? true,
      },
    });
    
    let jpAwarded = 0;
    
    if (completed) {
      if (user) {
        try {
          await assignJp(user, ActivityType.ALIGNED_ACTION);
          jpAwarded = 50; // Standard JP for completing an aligned action
        } catch (error) {
          console.error("Error assigning JP:", error);
          // Continue execution even if JP assignment fails
        }
      }
    } 
      
    // Add to progress vault
    await prisma.progressVault.create({
      data: {
        userId,
        content: `Completed 1% Start: ${action.selectedTask}`,
        jpPointsAssigned: jpAwarded > 0
      },
    });
    
    // Fetch the updated user data to get the current JP balance
    const updatedUser = await prisma.user.findUnique({
      where: {
        id: userId,
      }
    });
      
    return NextResponse.json({ 
      action: updatedAction,
      jpAwarded,
      newBalance: updatedUser?.jpBalance
    });
  } catch (error) {
    console.error("Error updating 1% Start action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}