import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import calculateProfileCompletion from "@/utils/calculateProfileCompletion";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const profile = await prisma.userBusinessProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 200 });
    }

    // Calculate completion percentage
    const completionPercentage = calculateProfileCompletion(profile);

    // Return the profile with the computed completion percentage
    const profileWithCompletion = {
      ...profile,
      completionPercentage,
    };
    console.log("Profile", profileWithCompletion);
    return NextResponse.json(
      {
        message: "Profile fetched successfully",
        profile: profileWithCompletion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Get profile API Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
