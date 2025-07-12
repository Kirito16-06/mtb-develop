import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseClient } from "@/lib/supabase";
import calculateProfileCompletion from "@/utils/calculateProfileCompletion";
import { assignJp } from "@/lib/utils/jp";
import { ActivityType } from "@prisma/client";

interface UserSpotlightProfile {
  featuredWorkTitle?: string | null;
  featuredWorkDesc?: string | null;
  featuredWorkImage?: string | null;
  priorityContactLink?: string | null;
}

function checkSpotlightFieldsComplete(profile: UserSpotlightProfile): boolean {
  const spotlightFields: (keyof UserSpotlightProfile)[] = [
    "featuredWorkTitle",
    "featuredWorkDesc",
    "featuredWorkImage",
    "priorityContactLink",
  ];

  return spotlightFields.every((field) => {
    const value = profile[field];
    return typeof value === "string" && value.trim() !== "";
  });
}

function tryParseJson(jsonString: unknown) {
  if (typeof jsonString !== "string") return {};
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON parse error:", e);
    return {};
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId || Array.isArray(userId)) {
    return NextResponse.json(
      { error: "Invalid or missing userId" },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData();
    const entries = Object.fromEntries(formData.entries());

    // Get existing profile first
    const existingProfile = await prisma.userBusinessProfile.findUnique({
      where: { userId },
    });

    // File upload handling
    let fileUrl: string | undefined;
    const file = formData.get("featuredWorkImage");

    if (file instanceof File && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `spotlight-image/${fileName}`;

      const { error } = await supabaseClient.storage
        .from("spotlight-image")
        .upload(filePath, file);

      if (error) throw new Error(`Supabase Upload Error: ${error.message}`);

      const { data: publicUrl } = supabaseClient.storage
        .from("spotlight-image")
        .getPublicUrl(filePath);

      fileUrl = publicUrl.publicUrl;
    }

    // Prepare update data
    const updateData = {
      name: entries.name?.toString(),
      businessInfo: entries.businessInfo?.toString(),
      missionStatement: entries.missionStatement?.toString(),
      goals: entries.goals?.toString(),
      keyOfferings: entries.keyOfferings?.toString(),
      achievements: entries.achievements?.toString(),
      email: entries.email === "" ? null : entries.email?.toString(),
      phone: entries.phone?.toString(),
      website: entries.website?.toString(),
      socialHandles: tryParseJson(entries.socialHandles) || {},
      isSpotlightActive: entries.isSpotlightActive === "true",
      featuredWorkTitle: entries.featuredWorkTitle?.toString(),
      featuredWorkDesc: entries.featuredWorkDesc?.toString(),
      // Preserve existing image if no new file is uploaded
      featuredWorkImage:
        fileUrl ||
        existingProfile?.featuredWorkImage ||
        entries.featuredWorkImage?.toString(),
      priorityContactLink: entries.priorityContactLink?.toString(),
    };

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if spotlight fields are complete
    const isSpotlightComplete = checkSpotlightFieldsComplete({
      ...existingProfile,
      ...updateData,
    });

    // Upsert the profile
    const profile = await prisma.userBusinessProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
        profileJpRewarded: false,
        isProfileComplete: isSpotlightComplete,
      },
      update: {
        ...updateData,
        isProfileComplete: isSpotlightComplete,
      },
    });

    const newCompletion = calculateProfileCompletion(profile);
    const oldCompletion = existingProfile
      ? calculateProfileCompletion(existingProfile)
      : 0;

    // JP Reward Logic
    if (
      newCompletion >= 100 &&
      oldCompletion < 100 &&
      !(existingProfile && existingProfile.profileJpRewarded)
    ) {
      assignJp(user, ActivityType.BUSINESSPROFILE_COMPLETE);

      await prisma.userBusinessProfile.update({
        where: { userId },
        data: { profileJpRewarded: true },
      });
    }

    return NextResponse.json(
      { message: "Profile updated successfully", profile },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Update error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
