import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for profile view tracking
const profileViewSchema = z.object({
  userId: z.string(),
  viewerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request data
    const result = profileViewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { userId, viewerId } = result.data;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the profile view already exists
    if (viewerId) {
      const existingView = await prisma.profileView.findFirst({
        where: {
          userId,
          viewerId,
        },
      });

      if (existingView) {
        return NextResponse.json({
          success: true,
          message: "Profile view already recorded",
        });
      }
    }

    // Create profile view record
    const view = await prisma.profileView.create({
      data: {
        userId,
        viewerId,
      },
    });

    return NextResponse.json({
      success: true,
      view,
    });
  } catch (error) {
    console.error("Error tracking profile view:", error);
    return NextResponse.json(
      { error: "Failed to track profile view" },
      { status: 500 }
    );
  }
}