import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { checkRole } from "@/lib/utils/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Attempting to delete request with ID:", id);

    // Verify Prisma client is initialized
    if (!prisma) {
      console.error("Prisma client is not initialized");
      throw new Error("Prisma client is not initialized");
    }

    // Validate ID format (optional, depending on your ID type)
    if (!id || typeof id !== "string") {
      console.error("Invalid ID provided:", id);
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Check for reviews in APPROVED or SUBMITTED state and delete others in a transaction

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [existingReviews, _deleteReviews, deletedRequest] = await prisma
      .$transaction([
        prisma.buddyLensReview.findMany({
          where: {
            requestId: id,
            status: { in: ["APPROVED", "SUBMITTED"] },
          },
        }),
        prisma.buddyLensReview.deleteMany({
          where: {
            requestId: id,
            status: { notIn: ["APPROVED", "SUBMITTED"] },
          },
        }),
        prisma.buddyLensRequest.delete({
          where: { id },
        }),
      ])
      .catch((err) => {
        throw err;
      });

    if (existingReviews.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete request: It has reviews in APPROVED or SUBMITTED state.",
        },
        { status: 400 }
      );
    }

    console.log("Request deleted successfully:", deletedRequest);

    return NextResponse.json(
      { message: "Request deleted successfully", data: deletedRequest },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log("Error deleting request:", error);
    // Type guard for Prisma errors
    const isPrismaError = (
      err: unknown
    ): err is Prisma.PrismaClientKnownRequestError =>
      err instanceof Prisma.PrismaClientKnownRequestError;

    // Log error details
    console.error("Error deleting request:", {
      message: isPrismaError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error",
      code: isPrismaError(error) ? error.code : undefined,
      stack: isPrismaError(error)
        ? error.stack
        : error instanceof Error
          ? error.stack
          : undefined,
      // id: id,
    });

    // Handle Prisma-specific errors
    if (isPrismaError(error) && error.code === "P2025") {
      // Record not found
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Internal server error",
        details: isPrismaError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    await checkRole("USER");
    // const currentUserId = session?.user?.id;

    // if (!currentUserId) {
    //   console.error('Unauthorized access: No user session found');
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // If an ID is provided, fetch a single request
    const { id } = await params;
    console.log("Fetching request with ID:", id);

    if (!id) {
      console.error("Missing request ID");
      return NextResponse.json(
        { error: "Missing request ID" },
        { status: 400 }
      );
    }

    // if (id) {
    console.log("Fetching request with ID:", id);
    const request = await prisma.buddyLensRequest.findMany({
      where: { requesterId: id },
      include: {
        requester: true,
        reviewer: true,
        review: true,
        // transaction: true, // Uncomment if needed
      },
    });

    return NextResponse.json(request, { status: 200 });
    // }
  } catch (error: unknown) {
    console.error("GET Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
