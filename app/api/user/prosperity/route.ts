import { checkRole } from "@/lib/utils/auth";
import { ActivityType, ProsperityDropStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJpToDeduct } from "@/lib/utils/jp";
import { getProsperityAppliedNotificationData } from "@/lib/utils/notifications";

export async function POST(request: Request) {
  try {
    // Check user role and get session
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );
    const userId = session.user.id;

    // Get request body
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Get prosperity drop activity data
    const prosperityActivity = await prisma.activity.findUnique({
      where: { activity: ActivityType.PROSPERITY_DROP },
    });

    if (!prosperityActivity) {
      return NextResponse.json(
        { error: "Prosperity drop activity not configured" },
        { status: 400 }
      );
    }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        prosperityDrops: {
          where: { status: { in: ["APPLIED", "IN_REVIEW", "APPROVED"] } },
        },
        plan: true, // Include plan details for JP calculation
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const jpRequired = getJpToDeduct(user, prosperityActivity);

    // Check if user has a pending application
    if (user.prosperityDrops.length > 0) {
      return NextResponse.json(
        { error: "You already have a pending prosperity drop application" },
        { status: 400 }
      );
    }

    // Check if user has enough JP
    if (user.jpBalance < jpRequired) {
      return NextResponse.json({ error: "Insufficient JP" }, { status: 400 });
    }

    const notificationData = getProsperityAppliedNotificationData(userId);

    // Deduct JP and create transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          jpSpent: { increment: jpRequired },
          jpBalance: { decrement: jpRequired },
          jpTransaction: { increment: jpRequired },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: userId,
          activityId: prosperityActivity.id,
          jpAmount: jpRequired,
        },
      }),
      prisma.prosperityDrop.create({
        data: {
          userId: userId,
          title,
          description,
          status: ProsperityDropStatus.APPLIED,
        },
      }),
      prisma.notification.create({ data: notificationData }),
    ]);

    return NextResponse.json(
      { message: "Prosperity drop application created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );
    const userId = session.user.id;

    const prosperityApplications = await prisma.prosperityDrop.findMany({
      where: { userId: userId },
      select: {
        id: true,
        status: true,
        title: true,
        description: true,
        appliedAt: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    if (!prosperityApplications.length) {
      return NextResponse.json(
        { message: "No prosperity drop applications found" },
        { status: 404 }
      );
    }

    return NextResponse.json(prosperityApplications, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
