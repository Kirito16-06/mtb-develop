import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { userId, reason, blockedBy } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: "Missing userId or reason" },
        { status: 400 }
      );
    }

    // Update the user to set isBlocked to true
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    // Create a new blocked record
    await prisma.blockedUsers.create({
      data: {
        userId,
        reason,
        blockedBy: blockedBy || null, // optionally pass admin id or email
      },
    });

    return NextResponse.json({
      message: "User blocked successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}
