import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";

const errorResponse = (message: string, status: number = 400) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  try {
    // const session = await getServerSession(authConfig);
    // if (!session?.user?.email) {
    //   return errorResponse("Please log in", 401);
    // }

    // Check if user has permission to access this endpoint
    // const hasAccess = await checkRole(session.user.id, ["USER", "ADMIN"]);

    const session = await checkRole("USER");
    // if (!hasAccess) {
    //   return errorResponse("Unauthorized access", 403);
    // }

    const claims = await prisma.buddyLensRequest.findMany({
      where: {
        review: {
          some: {
            reviewerId: session.user.id,
            status: { in: ["PENDING", "APPROVED", "DISAPPROVED", "SUBMITTED"] },
          },
        },
        isDeleted: false,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        review: {
          where: {
            reviewerId: session.user.id,
          },
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    return errorResponse("Failed to fetch claims", 500);
  }
}
