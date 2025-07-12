import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";
import { ActivityType } from "@prisma/client";
import {
  getMagicBoxRewardNotificationData,
  getMagicBoxSharedNotificationData,
} from "@/lib/utils/notifications";
import { sendPushNotificationToUser } from "@/lib/utils/pushNotifications";
import { sendEmailUsingTemplate } from "@/utils/sendEmail";

// GET: Retrieve or create user's magic box for today
export async function GET() {
  try {
    const session = await checkRole("USER");
    const userId = session.user.id;

    // Check if user already has a magic box for today
    const today = new Date();
    today.setHours(0, 0, 0); // Start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    // Find magic box created today
    const existingBox = await prisma.magicBox.findFirst({
      where: { userId, createdAt: { gte: today, lt: tomorrow } },
    });

    // If box exists, return it with appropriate details
    if (existingBox) {
      // If box is opened but not redeemed, fetch random users to display
      if (
        existingBox.isOpened &&
        !existingBox.isRedeemed &&
        existingBox.randomUserIds.length > 0
      ) {
        const randomUsers = await prisma.user.findMany({
          where: { id: { in: existingBox.randomUserIds as string[] } },
          select: { id: true, name: true, image: true },
        });

        return NextResponse.json(
          {
            message: "Magic box retrieved successfully",
            magicBox: existingBox,
            randomUsers,
            status: "OPENED",
          },
          { status: 200 }
        );
      }

      // If box is redeemed, just return with next box time
      if (existingBox.isRedeemed) {
        return NextResponse.json(
          {
            message: "Magic box already redeemed today",
            magicBox: existingBox,
            status: "REDEEMED",
          },
          { status: 200 }
        );
      }

      // Box exists but isn't opened yet
      return NextResponse.json(
        {
          message: "Magic box retrieved successfully",
          magicBox: existingBox,
          status: "UNOPENED",
        },
        { status: 200 }
      );
    }

    // No box for today, create a new one
    // Set next box availability to tomorrow at midnight
    const nextBoxAt = tomorrow;

    // Create a new magic box
    const newMagicBox = await prisma.magicBox.create({
      data: { userId, nextBoxAt, randomUserIds: [] },
    });

    return NextResponse.json(
      {
        message: "New magic box created",
        magicBox: newMagicBox,
        status: "UNOPENED",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Get/Create magic box API Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Open an existing magic box
export async function POST(request: NextRequest) {
  try {
    const session = await checkRole("USER");
    const userId = session.user.id;
    const data = await request.json();
    const { boxId } = data;

    // Find the magic box
    const magicBox = await prisma.magicBox.findUnique({
      where: { id: boxId, userId },
    });

    if (!magicBox) {
      return NextResponse.json(
        { error: "Magic box not found" },
        { status: 404 }
      );
    }

    // ? this conditoin will only run when some one intentiaolly tries to run this api when box is already opened else this condition will never run as box will not be open when this api will be called from frontend
    // If box is already opened
    if (magicBox.isOpened) {
      // If opened but not redeemed, return random users
      if (!magicBox.isRedeemed && magicBox.randomUserIds.length > 0) {
        const randomUsers = await prisma.user.findMany({
          where: { id: { in: magicBox.randomUserIds as string[] } },
          select: { id: true, name: true, image: true },
        });

        return NextResponse.json(
          {
            message: "Magic box already opened",
            magicBox,
            randomUsers,
            status: "OPENED",
          },
          { status: 200 }
        );
      }

      // If redeemed, just return with next box time
      return NextResponse.json(
        { message: "Magic box already redeemed", magicBox, status: "REDEEMED" },
        { status: 200 }
      );
    }

    // Get magic box settings
    const settings = await prisma.magicBoxSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    // If no settings, use defaults
    const minJp = settings?.minJpAmount || 100;
    const maxJp = settings?.maxJpAmount || 500;

    interface RandomUser {
      id: string;
      name: string;
      image: string | null;
    }

    const randomUsers = await prisma.$queryRaw<RandomUser[]>`
  SELECT id, name, image
  FROM "User"
  WHERE id != ${userId} AND "isBlocked" = false  AND "role" = 'USER'
  ORDER BY RANDOM()
  LIMIT 4;
`;

    // Generate random JP amount
    let jpAmount = Math.floor(Math.random() * (maxJp - minJp + 1) + minJp);
    // let jpAmount =
    // Math.floor(Math.random() * ((maxJp - minJp + 1) / 2)) * 2 + minJp;
    if (jpAmount % 2 !== 0) jpAmount += 1;

    // Update the box as opened with JP amount and random users
    const updatedBox = await prisma.magicBox.update({
      where: { id: boxId },
      data: {
        isOpened: true,
        openedAt: new Date(),
        jpAmount,
        randomUserIds: randomUsers.map((user) => user.id),
        // randomUserIds: [
        //   "135277e5-c5a0-4f30-9ff4-80c8ea073274",
        //   "2df547e6-8a99-4446-b7a1-bb40c03da956",
        //   "3cf52e3d-1da3-4519-ab27-cd4d95433bcd",
        //   "cm8bfebgv0001w5twdko6ldbt",
        // ],
      },
    });

    return NextResponse.json(
      {
        message: "Magic box opened successfully",
        magicBox: updatedBox,
        randomUsers,
        status: "OPENED",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Open magic box API Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Redeem a magic box
export async function PUT(request: NextRequest) {
  try {
    const session = await checkRole("USER");
    const userId = session.user.id;
    const data = await request.json();
    const { boxId, selectedUserId } = data;

    // Find the magic box
    const magicBox = await prisma.magicBox.findUnique({
      where: { id: boxId, userId },
    });

    if (!magicBox) {
      return NextResponse.json(
        { error: "Magic box not found" },
        { status: 404 }
      );
    }

    // Check if box is opened
    if (!magicBox.isOpened) {
      return NextResponse.json(
        { error: "Magic box must be opened before redeeming" },
        { status: 400 }
      );
    }

    // Check if already redeemed
    if (magicBox.isRedeemed) {
      return NextResponse.json(
        { message: "Magic box already redeemed", magicBox, status: "REDEEMED" },
        { status: 200 }
      );
    }

    // Validate selected user
    if (!selectedUserId) {
      return NextResponse.json(
        { error: "Selected user is required for redemption" },
        { status: 400 }
      );
    }

    // Check if selected user is one of the random users
    if (!(magicBox.randomUserIds as string[]).includes(selectedUserId)) {
      return NextResponse.json(
        { error: "Selected user is not valid for this magic box" },
        { status: 400 }
      );
    }

    // Get selected user's details for email
    const selectedUser = await prisma.user.findUnique({
      where: { id: selectedUserId },
      select: { email: true, name: true },
    });

    if (!selectedUser) {
      return NextResponse.json(
        { error: "Selected user not found" },
        { status: 404 }
      );
    }

    // Get JP amount
    const jpAmount = magicBox.jpAmount || 0;
    const userJpAmount = Math.floor(jpAmount / 2); // Half goes to user
    const sharedJpAmount = Math.floor(jpAmount / 2); // Half is shared

    const magicBoxActivity = await prisma.activity.findUnique({
      where: { activity: ActivityType.MAGIC_BOX_REWARD },
    });
    console.log("magicBoxActivity", magicBoxActivity); //?dev

    const magicBoxRewardActivity = await prisma.activity.findUnique({
      where: { activity: ActivityType.MAGIC_BOX_SHARED_REWARD },
    });
    console.log("magicBoxRewardActivity", magicBoxRewardActivity); //?dev

    // get data to give notificaiton to user who has recieve the th other half
    const reciverNotificationData = getMagicBoxSharedNotificationData(
      userId,
      session?.user?.name || "",
      selectedUserId,
      sharedJpAmount
    );

    const senderNotificationData = getMagicBoxRewardNotificationData(
      userId,
      userJpAmount
    );

    const [updatedBox] = await prisma.$transaction([
      // Update magic box as redeemed
      prisma.magicBox.update({
        where: { id: boxId },
        data: { isRedeemed: true, redeemedAt: new Date(), selectedUserId },
      }),
      // Add JP to user's balance
      prisma.user.update({
        where: { id: userId },
        data: {
          jpBalance: { increment: userJpAmount },
          jpEarned: { increment: userJpAmount },
          jpTransaction: { increment: userJpAmount },
        },
      }),
      // Add JP to selected user's balance
      prisma.user.update({
        where: { id: selectedUserId },
        data: {
          jpBalance: { increment: sharedJpAmount },
          jpEarned: { increment: sharedJpAmount },
          jpTransaction: { increment: sharedJpAmount },
        },
      }),
      // Create transaction records for both users
      prisma.transaction.createMany({
        data: [
          { userId, activityId: magicBoxActivity!.id, jpAmount: userJpAmount },
          {
            userId: selectedUserId,
            activityId: magicBoxRewardActivity!.id,
            jpAmount: sharedJpAmount,
          },
        ],
      }),
      prisma.notification.create({ data: reciverNotificationData }),
      prisma.notification.create({ data: senderNotificationData }),
    ]);

    // Send notification to the selected user
    await sendPushNotificationToUser(
      selectedUserId,
      "Magic Box Shared",
      `You have received ${sharedJpAmount} JP from ${session?.user?.name || ""}`
    );

    // Send email to both users
    await Promise.all([
      sendEmailUsingTemplate({
        toEmail: selectedUser.email,
        toName: selectedUser.name,
        templateId: "magic-box-shared",
        templateData: {
          username: selectedUser.name,
          senderName: session.user.name,
          jpAmount: sharedJpAmount,
          profileUrl: `${process.env.NEXT_URL}/profile/${userId}`,
        },
      }),
      sendEmailUsingTemplate({
        toEmail: session.user.email!,
        toName: session.user.name!,
        templateId: "magic-box-sender",
        templateData: {
          username: session.user.name,
          receiverName: selectedUser.name,
          jpAmount: userJpAmount,
          sharedAmount: sharedJpAmount,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Magic box redeemed successfully",
        magicBox: updatedBox,
        jpEarned: userJpAmount,
        shared: { userId: selectedUserId, jpAmount: sharedJpAmount },
        status: "REDEEMED",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Redeem magic box API Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
