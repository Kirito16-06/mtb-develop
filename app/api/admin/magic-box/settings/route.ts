import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";
import { z } from "zod";

const settingsSchema = z.object({
  minJpAmount: z.number().min(1).max(1000),
  maxJpAmount: z.number().min(1).max(1000),
});

// GET: Get current magic box settings
export async function GET() {
  try {
    await checkRole("ADMIN");

    const settings = await prisma.magicBoxSettings.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(
      {
        message: "Magic box settings retrieved successfully",
        settings: settings || {
          minJpAmount: 100,
          maxJpAmount: 500,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Get magic box settings API Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update magic box settings
export async function PUT(request: NextRequest) {
  try {
    await checkRole("ADMIN");

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    const existingSettings = await prisma.magicBoxSettings.findFirst();

    const settings = existingSettings
      ? await prisma.magicBoxSettings.update({
          where: { id: existingSettings.id },
          data: {
            minJpAmount: validatedData.minJpAmount,
            maxJpAmount: validatedData.maxJpAmount,
          },
        })
      : await prisma.magicBoxSettings.create({
          data: {
            minJpAmount: validatedData.minJpAmount,
            maxJpAmount: validatedData.maxJpAmount,
          },
        });

    return NextResponse.json(
      {
        message: "Magic box settings updated successfully",
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Update magic box settings API Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
