import { checkRole } from "@/lib/utils/auth";
import { SpotlightStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSpotlightApprovedNotification } from "@/lib/utils/notifications"; // For in-app notification
import { sendPushNotificationToUser } from "@/lib/utils/pushNotifications"; // For push notification

// Define valid status transitions
const VALID_STATUS_TRANSITIONS: Record<SpotlightStatus, SpotlightStatus[]> = {
  APPLIED: ["IN_REVIEW", "APPROVED", "DISAPPROVED"],
  IN_REVIEW: ["APPROVED", "DISAPPROVED"],
  APPROVED: ["ACTIVE"],
  DISAPPROVED: [], // Terminal state
  ACTIVE: [], // Can only be changed to EXPIRED by cron
  EXPIRED: [], // Terminal state
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkRole("ADMIN", "You are not authorized for this action");

    const { status: newStatus } = await request.json();
    const { id } = await params;

    // Validate status exists
    if (!Object.values(SpotlightStatus).includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid spotlight status" },
        { status: 400 }
      );
    }

    const spotlight = await prisma.spotlight.findUnique({
      where: { id },
      include: { user: true }, // Include the user to get their ID
    });

    if (!spotlight) {
      return NextResponse.json(
        { error: "Spotlight application not found" },
        { status: 404 }
      );
    }

    // Check if current status matches requested status
    if (spotlight.status === newStatus) {
      return NextResponse.json(
        {
          error: `Spotlight application is already ${newStatus.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[spotlight.status];
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot change status from ${spotlight.status} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    // Update spotlight status
    await prisma.spotlight.update({
      where: { id },
      data: { status: newStatus },
    });

    // If status changed to APPROVED, send notifications (separately)
    if (newStatus === SpotlightStatus.APPROVED) {
      // Create in-app notification
      await createSpotlightApprovedNotification(spotlight.userId);

      // Send push notification separately (if user has subscriptions)
      await sendPushNotificationToUser(
        spotlight.userId,
        "Spotlight Approved",
        "Your spotlight application has been approved. Congratulations!",
        { url: "/dashboard" }
      );
      console.log("Push notification sent to user:", spotlight.userId);
    }

    return NextResponse.json(
      { message: `Spotlight status changed to ${newStatus} successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
