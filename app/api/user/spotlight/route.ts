import { checkRole } from "@/lib/utils/auth";
import { ActivityType, SpotlightStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJpToDeduct } from "@/lib/utils/jp";
import { sendEmailUsingTemplate } from "@/utils/sendEmail";
import { format } from "date-fns";
import { getSpotlightAppliedNotificationData } from "@/lib/utils/notifications";

//! add check for profile completion

// * a user can only has one and only one spotlight in ACTIVE | IN_REVIEW | ACTIVE | APPLIED state

// * route to apply for spotlight
export async function POST() {
  try {
    // Check user role and get session
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );
    const userId = session.user.id;

    // Get spotlight activity data
    const spotlightActivity = await prisma.activity.findUnique({
      where: { activity: ActivityType.SPOTLIGHT },
    });

    if (!spotlightActivity) {
      return NextResponse.json(
        { error: "Spotlight activity not configured" },
        { status: 400 }
      );
    }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        spotlight: {
          where: {
            status: { in: ["ACTIVE", "IN_REVIEW", "APPLIED", "APPROVED"] },
          },
        },
        userBusinessProfile: true,
        plan: true, // Include plan details for JP calculation
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const jpRequired = getJpToDeduct(user, spotlightActivity);

    // Check if user's business profile is complete
    const businessProfile = user.userBusinessProfile[0];
    if (!businessProfile || !businessProfile.isProfileComplete) {
      return NextResponse.json(
        {
          error: "Complete your business profile before applying for spotlight",
        },
        { status: 400 }
      );
    }

    // Check if user has an active spotlight, in review, or already applied
    if (user.spotlight && user.spotlight.length > 0) {
      if (user.spotlight[0].status === SpotlightStatus.ACTIVE) {
        return NextResponse.json(
          { error: "You already have an active spotlight" },
          { status: 400 }
        );
      }
      if (
        user.spotlight[0].status === "IN_REVIEW" ||
        user.spotlight[0].status === "APPLIED"
      ) {
        return NextResponse.json(
          { error: "You already have a spotlight application in review" },
          { status: 400 }
        );
      }
      if (user.spotlight[0].status === "APPROVED") {
        return NextResponse.json(
          { error: "You already have an approved spotlight" },
          { status: 400 }
        );
      }
    }

    // Check if user has enough JP
    if (user.jpBalance < jpRequired) {
      return NextResponse.json({ error: "Insufficient JP" }, { status: 400 });
    }

    // estimated activation date for spotlight
    const latestSpotlight = await prisma.spotlight.findFirst({
      where: {
        activatedAt: {
          gte: new Date(), // future activations
        },
      },
      orderBy: {
        activatedAt: "desc",
      },
    });

    let estimatedActivationDate: Date;

    if (latestSpotlight && latestSpotlight.activatedAt) {
      estimatedActivationDate = new Date(
        latestSpotlight.activatedAt.getTime() + 24 * 60 * 60 * 1000
      );
    } else {
      estimatedActivationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    const notificationData = getSpotlightAppliedNotificationData(userId);

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
          activityId: spotlightActivity.id,
          createdAt: new Date(),
          jpAmount: jpRequired,
        },
      }),
      prisma.spotlight.create({
        data: {
          userId: userId,
          status: "APPLIED",
          // isActive: false,
        },
      }),
      prisma.notification.create({
        data: notificationData,
      }),
    ]);

    // send email to user
    await sendEmailUsingTemplate({
      toEmail: user.email,
      toName: user.name,
      templateId: "spotlight-applied",
      templateData: {
        username: user.name,
        insert_date: format(estimatedActivationDate, "MMM d, yyyy"),
      },
    });

    return NextResponse.json(
      {
        message:
          "Spotlight application created successfully, checkout your mailbox for more information.",
        estimatedActivationDate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// * route to get user spotlight application status
export async function GET() {
  try {
    // Check user role and get session
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );
    const userId = session.user.id;
    console.log(userId); //?dev

    const spotlightApplications = await prisma.spotlight.findMany({
      where: { userId: userId },
      select: {
        id: true,
        status: true,
        // isActive: true,
        appliedAt: true,
        expiresAt: true,
        user: {
          omit: {
            password: true,
          },
        },
      },
    });

    console.log(spotlightApplications);

    if (!spotlightApplications) {
      return NextResponse.json(
        { message: "No spotlight application found" },
        { status: 404 }
      );
    }

    return NextResponse.json(spotlightApplications, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
