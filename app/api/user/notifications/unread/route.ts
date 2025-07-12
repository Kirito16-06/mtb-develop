import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";
// GET: Get unread notifications count for the user
export async function GET() {
  try {
    const session = await checkRole("USER");
    const userId = session.user.id;

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread notification count" },
      { status: 500 }
    );
  }
}
