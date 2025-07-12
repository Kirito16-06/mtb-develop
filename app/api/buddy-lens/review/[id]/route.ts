import { checkRole } from "@/lib/utils/auth";
import { BuddyLensRequestStatus, BuddyLensReviewStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ message }, { status });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(
    "GET /api/buddy-lens/approve ------------------------ ITZ WORKING"
  );
  try {
    await checkRole("USER");

    // const requestId = searchParams.get("requestId");
    const { id: requestId } = await params; // ✅ Access params from context

    console.log(
      "GET /api/buddy-lens/approve - Request ID:",
      requestId,
      "reviewerId"
      // reviewerId
    );

    if (!requestId) {
      return errorResponse("Request ID is required", 400);
    }

    // Fetch a single request by ID (existing logic)
    const review = await prisma.buddyLensReview.findFirst({
      where: {
        request: {
          id: requestId,
          // reviewerId: reviewerId!,
          status: BuddyLensRequestStatus.CLAIMED,
        },
        status: BuddyLensReviewStatus.APPROVED,
      },
      include: {
        request: {
          include: {
            requester: { omit: { password: true } },
            reviewer: { omit: { password: true } },
          },
        },
        reviewer: { omit: { password: true } },
      },
    });

    console.log("review ------", review);

    // console.log(
    //   "GET /api/buddy-lens/approve - Request:",
    //   review ? review.request.id : "Not found"
    // );
    if (!review ) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("GET /api/buddy-lens/approve - Error:", error);
    return errorResponse("Failed to fetch requests", 500);
  }
}
