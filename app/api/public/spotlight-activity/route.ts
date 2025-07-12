// File: app/api/spotlight/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for activity tracking
const activitySchema = z.object({
  spotlightId: z.string(),
  type: z.enum(["VIEW", "CONNECT"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request data
    const result = activitySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { spotlightId, type } = result.data;

    // Verify spotlight exists
    const spotlight = await prisma.spotlight.findUnique({
      where: { id: spotlightId },
    });

    if (!spotlight) {
      return NextResponse.json(
        { error: "Spotlight not found" },
        { status: 404 }
      );
    }

    // Create activity record
    const activity = await prisma.spotlightActivity.create({
      data: {
        type,
        spotlightId,
      },
    });

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("Error tracking spotlight activity:", error);
    return NextResponse.json(
      { error: "Failed to track activity" },
      { status: 500 }
    );
  }
}
