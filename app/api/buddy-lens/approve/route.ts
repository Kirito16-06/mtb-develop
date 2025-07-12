import { NextRequest, NextResponse } from "next/server";
// import { NotificationService } from "@/lib/notification-service";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { BuddyLensRequestStatus, BuddyLensReviewStatus } from "@prisma/client";
import {
  createBuddyLensApprovedNotification,
  createBuddyLensCancelledNotification,
} from "@/lib/utils/notifications";

interface ApiError extends Error {
  response?: {
    status: number;
    data: string;
  };
}

const errorResponse = (message: string, status: number = 400) =>
  NextResponse.json({ error: message }, { status });

// Helper function to send emails
async function sendEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  fromName?: string
) {
  console.log("Preparing to send email:", { toEmail, subject, fromName });

  try {
    const senderEmail = process.env.CONTACT_SENDER_EMAIL;
    const brevoApiKey = process.env.BREVO_API_KEY;

    console.log("Environment variables:", {
      senderEmail: senderEmail ? "Set" : "Missing",
      brevoApiKey: brevoApiKey
        ? "Set (first 4 chars: " + brevoApiKey.slice(0, 4) + ")"
        : "Missing",
    });

    if (!senderEmail || !brevoApiKey) {
      throw new Error(
        "Missing email configuration: CONTACT_SENDER_EMAIL or BREVO_API_KEY not set"
      );
    }

    const brevoApiUrl = "https://api.brevo.com/v3/smtp/email";
    const headers = {
      "Content-Type": "application/json",
      "api-key": brevoApiKey,
    };

    const emailPayload = {
      sender: { email: senderEmail, name: fromName || "MyThriveBuddy" },
      to: [{ email: toEmail, name: toName || "User" }],
      subject,
      htmlContent,
    };

    console.log("Sending email to Brevo API...");
    const response = await axios.post(brevoApiUrl, emailPayload, { headers });
    console.log("Email sent successfully:", {
      status: response.status,
      messageId: response.data.messageId,
    });
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Email sending failed:", error.message);
      const apiError = error as ApiError; // if you want, you can still type this better later
      if (apiError.response) {
        console.error("Brevo API Error:", {
          status: apiError.response.status,
          data: apiError.response.data,
        });
      }
      return {
        success: false,
        error: error.message,
        status: apiError.response?.status,
      };
    } else {
      console.error("Unknown email sending error:", error);
      return { success: false, error: "Unknown error", status: 500 };
    }
  }
}

// GET API with approve links for approve page
export async function GET(req: Request) {
  console.log(
    "GET /api/buddy-lens/approve ------------------------ ITZ WORKING"
  );
  try {
    const session = await getServerSession(authConfig);
    console.log(
      "GET /api/buddy-lens/approve - Session:",
      session?.user?.id || "No session"
    );
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    const status =
      (searchParams.get("status") as BuddyLensReviewStatus) ||
      BuddyLensReviewStatus.PENDING;
    // const reviewerId = searchParams.get("reviewerId");

    if (requestId) {
      console.log(
        "GET /api/buddy-lens/approve - Request ID:",
        requestId,
        "reviewerId"
        // reviewerId
      );
      // Fetch a single request by ID (existing logic)
      const review = await prisma.buddyLensReview.findMany({
        where: {
          request: {
            id: requestId,
            // reviewerId: reviewerId!,
            status: BuddyLensRequestStatus.OPEN,
          },
          status,
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
      if (!review || review.length === 0) {
        return NextResponse.json(
          { message: "Request not found" },
          { status: 404 }
        );
      }
      // console.log(
      //   "review.request.requesterId",
      //   review.request.requesterId,
      //   "session.user.id ",
      //   session.user.id
      // );
      // if (
      //   review.request.requesterId !== session.user.id ||
      //   review.request.reviewerId !== session.user.id
      // ) {
      //   console.log("GET /api/buddy-lens/approve - Unauthorized:", {
      //     requesterId: review.request.requesterId,
      //     reviewerId: review.request.reviewerId,
      //     userId: session.user.id,
      //   });
      //   return errorResponse("Unauthorized to view this request", 403);
      // }

      return NextResponse.json(review);
    } else {
      console.log(
        "GET /api/buddy-lens/approve - --------------------------------------"
      );
      // Fetch all pending requests for the requester
      // const requests = await prisma.buddyLensRequest.findMany({
      const requests = await prisma.buddyLensReview.findMany({
        where: {
          // requesterId: session.user.id,
          // status: 'PENDING',
          // isDeleted: false,
          request: {
            requesterId: session.user.id,
            status: BuddyLensRequestStatus.OPEN,
            isDeleted: false,
          },
          status,
        },
        include: {
          request: {
            include: {
              requester: { select: { id: true, name: true, email: true } },
              reviewer: { select: { id: true, name: true, email: true } },
            },
          },
          reviewer: { omit: { password: true } },
          // reviewer: { select: { id: true, name: true, email: true } },
        },
      });
      console.log("requests TO APPROVE---------------------------", requests);

      console.log(
        "GET /api/buddy-lens/approve - Fetched pending requests:",
        requests.length
      );
      return NextResponse.json(requests);
    }
  } catch (error) {
    console.error("GET /api/buddy-lens/approve - Error:", error);
    return errorResponse("Failed to fetch requests", 500);
  }
}

// PATCH API with email
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    console.log(
      "PATCH /api/buddy-lens/approve - Session:",
      session?.user?.id || "No session"
    );
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    console.log("PATCH /api/buddy-lens/approve - Body:", body);
    const { requestId, reviewerId, approve, requesterId } = body;

    console.log(
      " requestId, reviewerId, approve, requesterId ---- ",
      requestId,
      reviewerId,
      approve,
      requesterId
    );

    if (!requestId || !reviewerId || approve === undefined || !requesterId) {
      return errorResponse(
        "Missing request ID, reviewer ID, approve status, or requester ID",
        400
      );
    }

    if (requesterId !== session.user.id) {
      console.log("PATCH /api/buddy-lens/approve - Unauthorized:", {
        requesterId,
        userId: session.user.id,
      });
      return errorResponse(
        "Only the requester can approve or reject claims",
        403
      );
    }

    const request = await prisma.buddyLensRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
      },
    });
    console.log(
      "request TO APPROVE/reject---------------------------",
      request
    );

    console.log(
      "PATCH /api/buddy-lens/approve - Request:",
      request ? request.id : "Not found"
    );
    if (!request || request.isDeleted) {
      return errorResponse("Request not found", 404);
    }

    if (request.status !== "OPEN") {
      return errorResponse(
        `Request is not in open status, current status: ${request.status}`,
        400
      );
    }

    if (request.reviewerId) {
      return errorResponse(`Request already has a reviewer`, 400);
    }

    // if (request.status !== 'PENDING') {
    //   return errorResponse(`Request is not in PENDING status, current status: ${request.status}`, 400);
    // }

    // if (request !== reviewerId) {
    //   console.log("PATCH /api/buddy-lens/approve - Invalid reviewer:", {
    //     // pendingReviewerId: request.reviewer,
    //     reviewerId,
    //   });
    //   return errorResponse("Reviewer ID does not match pending reviewer", 403);
    // }

    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: { id: true, name: true, email: true },
    });

    if (!reviewer) {
      return errorResponse("Reviewer not found", 404);
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    let emailResult: {
      success: boolean;
      messageId?: string;
      error?: string;
      status?: number;
    } = {
      success: false,
      error: "Email not sent yet",
    };

    const updatedRequest = await prisma.$transaction(async (prisma) => {
      const updateData = approve
        ? { status: "CLAIMED" as const, reviewerId }
        : { status: "OPEN" as const };

      const updated = await prisma.buddyLensRequest.update({
        where: { id: requestId },
        data: updateData,
      });

      await prisma.buddyLensReview.update({
        where: {
          requestId_reviewerId: {
            requestId,
            reviewerId,
          },
        },
        data: {
          status: approve ? "APPROVED" : "DISAPPROVED",
        },
      });

      const notificationExists = await prisma.userNotification.findFirst({
        where: {
          userId: reviewerId,
          link: `/dashboard/buddy-lens/reviewer?requestId=${requestId}`,
        },
      });

      // if already reviewd

      if (!notificationExists) {
        if (approve) {
          await createBuddyLensApprovedNotification(
            reviewerId,
            request.domain,
            requestId
          );
        }
        // else {
        //   await createBuddyLensCancelledNotification(
        //     reviewerId,
        //     request.domain
        //   );
        // }
      }

      // Send email within transaction if reviewer has email
      if (reviewer.email) {
        const subject = approve
          ? "BuddyLens Review Request Claim Approved"
          : "BuddyLens Review Request Claim Rejected";
        const actionUrl = approve
          ? `${baseUrl}/dashboard/buddy-lens/reviewer?requestId=${requestId}`
          : `${baseUrl}/dashboard/buddy-lens/reviewer`;
        const actionText = approve ? "Start Review" : "View Dashboard";
        const htmlContent = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #4F46E5;">${approve ? "Claim Approved" : "Claim Rejected"}</h1>
                </div>
                <p>Hello ${reviewer.name || "User"},</p>
                <p>Your claim for the BuddyLens request in ${request.domain} has been ${
                  approve ? "approved" : "rejected"
                } by ${request.requester.name || "the requester"}.</p>
                ${
                  approve
                    ? "<p>You can now start your review by filling out the review form.</p>"
                    : "<p>You can view other available requests on the reviewer dashboard.</p>"
                }
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${actionUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">${actionText}</a>
                </div>
                <p>If you have any questions, please contact support.</p>
                <p>Thank you,<br>The MyThriveBuddy Team</p>
              </div>
            </body>
          </html>
        `;

        try {
          emailResult = await sendEmail(
            reviewer.email,
            reviewer.name || "User",
            subject,
            htmlContent,
            "MyThriveBuddy"
          );

          if (!emailResult.success) {
            console.error(
              `Failed to send ${approve ? "approval" : "rejection"} email within transaction: ${emailResult.error}`
            );
          } else {
            console.log(
              `${approve ? "Approval" : "Rejection"} email sent successfully within transaction`
            );
          }
        } catch (error) {
          console.error("Transaction email sending failed:", error);
          // Continue with the transaction even if email fails
        }
      } else {
        console.warn("No email address found for reviewer ID:", reviewerId);
      }

      return updated;
    });

    // Retry email sending outside transaction if it failed and reviewer has email
    if (!emailResult.success && reviewer.email) {
      try {
        console.log("Retrying email sending outside transaction...");
        const subject = approve
          ? "BuddyLens Review Request Claim Approved"
          : "BuddyLens Review Request Claim Rejected";
        const actionUrl = approve
          ? `${baseUrl}/dashboard/buddy-lens/reviewer?requestId=${requestId}`
          : `${baseUrl}/dashboard/buddy-lens/reviewer`;
        const actionText = approve ? "Start Review" : "View Dashboard";
        const htmlContent = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #4F46E5;">${approve ? "Claim Approved" : "Claim Rejected"}</h1>
                </div>
                <p>Hello ${reviewer.name || "User"},</p>
                <p>Your claim for the BuddyLens request in ${request.domain} has been ${
                  approve ? "approved" : "rejected"
                } by ${request.requester.name || "the requester"}.</p>
                ${
                  approve
                    ? "<p>You can now start your review by filling out the review form.</p>"
                    : "<p>You can view other available requests on the reviewer dashboard.</p>"
                }
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${actionUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">${actionText}</a>
                </div>
                <p>If you have any questions, please contact support.</p>
                <p>Thank you,<br>The MyThriveBuddy Team</p>
              </div>
            </body>
          </html>
        `;

        emailResult = await sendEmail(
          reviewer.email,
          reviewer.name || "User",
          subject,
          htmlContent,
          "MyThriveBuddy"
        );

        if (emailResult.success) {
          console.log(
            `${approve ? "Approval" : "Rejection"} email sent successfully on retry`
          );
        } else {
          console.error(
            `Failed to send ${approve ? "approval" : "rejection"} email on retry: ${emailResult.error}`
          );
        }
      } catch (error) {
        console.error("Retry email sending failed:", error);
      }
    }

    console.log(
      "PATCH /api/buddy-lens/approve - Updated request:",
      updatedRequest.id
    );
    return NextResponse.json(
      {
        message: approve
          ? "Claim approved successfully" +
            (emailResult.success ? " and notification email sent" : "")
          : "Claim rejected successfully" +
            (emailResult.success ? " and notification email sent" : ""),
        data: updatedRequest,
        emailSent: emailResult.success,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Email sending failed:", error.message);
      const apiError = error as ApiError; // if you want, you can still type this better later
      if (apiError.response) {
        console.error("Brevo API Error:", {
          status: apiError.response.status,
          data: apiError.response.data,
        });
      }
      return NextResponse.json({
        success: false,
        error: error.message,
        status: apiError.response?.status,
      });
    } else {
      console.error("Unknown email sending error:", error);
      return NextResponse.json({
        success: false,
        error: "Unknown error",
        status: 500,
      });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    console.log(
      "DELETE /api/buddy-lens/approve - Session:",
      session?.user?.id || "No session"
    );
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    const reviewerId = searchParams.get("reviewerId");

    console.log("DELETE /api/buddy-lens/approve - Params:", {
      requestId,
      reviewerId,
    });
    if (!requestId || !reviewerId) {
      return errorResponse("Missing request ID or reviewer ID", 400);
    }

    const request = await prisma.buddyLensRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });

    console.log(
      "DELETE /api/buddy-lens/approve - Request:",
      request ? request.id : "Not found"
    );
    if (!request || request.isDeleted) {
      return errorResponse("Request not found", 404);
    }

    if (request.status !== "PENDING") {
      return errorResponse(
        `Request is not in PENDING status, current status: ${request.status}`,
        400
      );
    }

    if (request.reviewerId !== reviewerId) {
      console.log("DELETE /api/buddy-lens/approve - Invalid reviewer:", {
        pendingReviewerId: request.reviewerId,
        reviewerId,
      });
      return errorResponse("Reviewer ID does not match pending reviewer", 403);
    }

    if (request.requesterId !== session.user.id) {
      console.log("DELETE /api/buddy-lens/approve - Unauthorized:", {
        requesterId: request.requesterId,
        userId: session.user.id,
      });
      return errorResponse("Only the requester can cancel claims", 403);
    }

    const updatedRequest = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.buddyLensRequest.update({
        where: { id: requestId },
        data: {
          reviewerId: null,
          status: "OPEN",
        },
      });

      const notificationExists = await prisma.userNotification.findFirst({
        where: {
          userId: reviewerId,
          message: {
            contains: `The claim for request has been cancelled`,
          },
        },
      });

      if (!notificationExists) {
        await createBuddyLensCancelledNotification(reviewerId, request.domain);
      }

      return updated;
    });

    console.log(
      "DELETE /api/buddy-lens/approve - Updated request:",
      updatedRequest.id
    );
    return NextResponse.json(
      {
        message: "Claim cancelled successfully",
        data: updatedRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/buddy-lens/approve - Error:", error);
    return errorResponse("Failed to cancel claim", 500);
  }
}
