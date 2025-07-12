import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { BuddyLensRequestStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      socialMediaUrl, 
      questions, 
      jpCost, 
      // expiresInDays = 7,
      domain,
    } = body;

    // Validate input
    if (!socialMediaUrl || !questions || !jpCost || !domain ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user has enough JoyPearls
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { jpBalance: true },
    });

    if (!user || user.jpBalance < jpCost) {
      return new NextResponse("Insufficient JoyPearls", { status: 400 });
    }

    // Create the request
    const request = await prisma.buddyLensRequest.create({
      data: {
        requesterId: session.user.id,
        socialMediaUrl,
        questions,
        jpCost,
        // feedbackType,
        domain,
        // prelatform,
        // expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
        status: BuddyLensRequestStatus.PENDING,
      },
    });

    // Deduct JoyPearls
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        jpBalance: { decrement: jpCost },
        jpSpent: { increment: jpCost },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        activityId: "BUDDY_LENS_REQUEST",
        jpAmount: jpCost,
        // buddyLensRequestId: request.id,
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("[BUDDY_LENS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as BuddyLensRequestStatus | null;
    const type = searchParams.get("type"); // "requester" or "reviewer"

    let requests;
    if (type === "requester") {
      requests = await prisma.buddyLensRequest.findMany({
        where: {
          requesterId: session.user.id,
          ...(status && { status }),
        },
        include: {
          review: true,
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      requests = await prisma.buddyLensRequest.findMany({
        where: {
          reviewerId: session.user.id,
          ...(status && { status }),
        },
        include: {
          review: true,
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[BUDDY_LENS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}