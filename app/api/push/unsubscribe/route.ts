/**
 * API Route for unsubscribing from push notifications
 * POST /api/push/unsubscribe
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to unsubscribe from notifications" },
        { status: 401 }
      );
    }

    // Get subscription data from request
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Delete subscription from database
    await prisma.pushSubscription
      .delete({
        where: { endpoint },
      })
      .catch((err) => {
        // Ignore if subscription doesn't exist
        if (err.code !== "P2025") throw err;
      });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully unsubscribed from notifications",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from notifications" },
      { status: 500 }
    );
  }
}
