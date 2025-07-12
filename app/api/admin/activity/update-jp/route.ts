import { NextResponse } from "next/server";
import { checkRole } from "@/lib/utils/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateJpSchema = z.object({
  activityId: z.string().uuid(),
  jpAmount: z.number().int().min(0),
});

export async function POST(req: Request) {
  try {
    await checkRole("ADMIN", "You are not authorized for this action");

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateJpSchema.parse(body);

    // console.log(`this is from updateJp route.ts : ${validatedData}`);

    // Update the activity
    const updatedActivity = await prisma.activity.update({
      where: { id: validatedData.activityId },
      data: { jpAmount: validatedData.jpAmount },
    });

    return NextResponse.json({
      success: true,
      data: updatedActivity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating activity JP amount:", error);
    return NextResponse.json(
      { error: "Failed to update activity JP amount" },
      { status: 500 }
    );
  }
}
