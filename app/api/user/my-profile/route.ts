import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { profileSchema } from "@/schema/zodSchema";
import handleSupabaseImageUpload from "@/lib/utils/supabase-image-upload";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    console.log("Session in POST:", session);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const profileData = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
    };
    console.log("Received profile data:", profileData);

    const validationResult = profileSchema.safeParse(profileData);
    if (!validationResult.success) {
      console.log("Validation errors:", validationResult.error.format());
      return NextResponse.json(
        {
          message: "Invalid profile data",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    let imageUrl = "";
    const profilePicture = formData.get("profilePicture") as File;

    if (profilePicture && profilePicture.size > 0) {
      try {
        console.log("Uploading profile picture...");
        imageUrl = await handleSupabaseImageUpload(
          profilePicture,
          "profile-images",
          session.user.email
        );
        console.log("Uploaded image URL:", imageUrl);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        return NextResponse.json(
          { message: "Failed to upload profile picture" },
          { status: 500 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: profileData.name,
        image: imageUrl || user.image,
        bio: profileData.bio,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        socialHandles: true,
        userBusinessProfile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile fetched successfully",
      profile: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
