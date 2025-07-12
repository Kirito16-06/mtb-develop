// app/api/buddy-lens/reviewer/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]/auth.config";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { ActivityType, BuddyLensRequestStatus } from "@prisma/client";
import { createBuddyLensReviewedNotification, createBuddyLensReviewerCompletedNotification, createBuddyLensClaimedNotification } from "@/lib/utils/notifications";

// import sendEmail from '@/lib/email/sendEmail';

const errorResponse = (message: string, status: number = 400) =>
  NextResponse.json({ error: message }, { status });

// Add these interfaces at the top of your file
// interface EmailResult {
//   success: boolean;
//   messageId?: string;
//   error?: string;
//   status?: number;
// }

interface ApiError extends Error {
  response?: {
    status: number;
    data: string;
    error: string;
  };
}

// Define the response type for the email sending process
interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: number;
}

// Helper function to send emails
async function sendEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  fromName?: string
): Promise<EmailResponse> {
  // Updated return type to EmailResponse
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

    // Return the custom response (not wrapped in NextResponse.json)
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Email sending failed:", error.message);
      const apiError = error as ApiError;

      // Log detailed API error information if available
      if (apiError.response) {
        console.error("Brevo API Error:", {
          status: apiError.response.status,
          data: apiError.response.data,
        });
      }

      // Return custom error response (not wrapped in NextResponse.json)
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

interface CreateReviewBody {
  requestId: string;
  answers: string[];
  reviewText: string;
  rating: number;
  feedback?: string;
  status?: "SUBMITTED" | "DRAFT";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) return errorResponse("Please log in", 401);

    const {
      requestId,
      answers,
      reviewText,
      rating,
      feedback,
      status = "SUBMITTED",
    } = (await req.json()) as CreateReviewBody;
    const reviewerId = session.user.id;
    console.log("POST /api/buddy-lens/reviewer", reviewerId);

    if (!requestId || !answers || !reviewText || !rating)
      return errorResponse(
        "Missing request ID, answers, review text, or rating",
        400
      );

    if (!Array.isArray(answers))
      return errorResponse("Answers must be an array", 400);
    if (rating < 1 || rating > 5)
      return errorResponse("Rating must be between 1 and 5", 400);
    if (!["SUBMITTED", "DRAFT"].includes(status))
      return errorResponse("Invalid status", 400);

    const request = await prisma.buddyLensRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        requesterId: true,
        requester: {
          select: { email: true, name: true, jpBalance: true, plan: true },
        },
        reviewerId: true, //? 9may
        reviewer: true, //? 9may
        review: { include: { reviewer: { omit: { password: true } } } },
        status: true,
        domain: true,
        tier: true,
        jpCost: true,
        // expiresAt: true,
        isDeleted: true,
        // reviewer: { select: { email: true, name: true } },
      },
    });

    // console.log(
    //   "when submitting request ------------------ ",
    //   "reviewerID",
    //   reviewerId,
    //   request?.review
    // );

    if (!request || request.isDeleted)
      return errorResponse("Request not found", 404);
    if (request.review.some((r) => r.reviewerId !== reviewerId))
      //?? 9may
      return errorResponse("You are not assigned to this request", 403);
    if (request.status !== "CLAIMED")
      return errorResponse("Request is not claimed", 400);
    // if (new Date(request.expiresAt) < new Date()) return errorResponse("Request has expired", 400);

    const jpCost = request.jpCost ?? 0;
    if (jpCost <= 0)
      return errorResponse("Invalid JP cost for this request", 400);

    const existingReview = await prisma.buddyLensReview.findFirst({
      where: { requestId, reviewerId },
    });

    if (existingReview && existingReview?.status === "SUBMITTED") {
      return errorResponse(
        "You have already submitted a review for this request",
        409
      );
    }

    const newReview = await prisma.$transaction(async (prisma) => {
      const review = await prisma.buddyLensReview.update({
        where: { requestId_reviewerId: { requestId, reviewerId } },
        data: {
          // requestId,
          // reviewerId,
          answers,
          reviewText,
          rating,
          feedback,
          status,
          submittedAt: status === "SUBMITTED" ? new Date() : undefined,
          request: {
            update: {
              status: BuddyLensRequestStatus.COMPLETED,
            },
          },
        },
      });

      if (status === "SUBMITTED") {
        // const updatedRequest = await prisma.buddyLensRequest.update({
        //   where: { id: requestId },
        //   data: { status: "COMPLETED", completedAt: new Date() },
        // });

        // Get activity types
        const creditActivity = await prisma.activity.findUnique({
          where: { activity: ActivityType.BUDDY_LENS_REVIEW },
        });
        const debitActivity = await prisma.activity.findUnique({
          where: { activity: ActivityType.BUDDY_LENS_REQUEST },
        });

        if (!creditActivity || !debitActivity)
          throw new Error("Required activity types not found");

        // JP transactions
        await prisma.user.update({
          where: { id: request.requesterId },
          data: {
            jpBalance: { decrement: jpCost },
            jpSpent: { increment: jpCost },
            jpTransaction: { increment: 1 },
          },
        });

        await prisma.user.update({
          where: { id: reviewerId },
          data: {
            jpBalance: { increment: jpCost },
            jpEarned: { increment: jpCost },
            jpTransaction: { increment: 1 },
          },
        });

        await prisma.transaction.createMany({
          data: [
            {
              userId: request.requesterId,
              jpAmount: jpCost,
              activityId: debitActivity.id,
            },
            {
              userId: reviewerId,
              jpAmount: jpCost,
              activityId: creditActivity.id,
            },
          ],
        });
        console.log("review ***************************** ", review);

        // Notify reviewer
        await createBuddyLensReviewerCompletedNotification(
          reviewerId,
          request.domain,
          jpCost,
        );

        // Notify requester
        await createBuddyLensReviewedNotification(
          request.requesterId,
          request.domain,
          jpCost,
          review.id
        );

        // Email to requester
        if (request.requester.email) {
          const reviewUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard/buddy-lens/reviewer/${request.id}`;
          const subject = "Joy Pearls Deducted for Reviewed Request";
          const htmlContent = `
            <p>Hello ${request.requester.name || "User"},</p>
            <p>Your BuddyLens request in ${request.domain} has been reviewed. ${jpCost} Joy Pearls have been deducted.</p>
            <p><a href="${reviewUrl}">View Review</a></p>
          `;

          await sendEmail(
            request.requester.email,
            request.requester.name || "User",
            subject,
            htmlContent,
            request.reviewer?.name || "MyThriveBuddy"
          );
        }

        // Email to reviewer after submission reviewed for requester
        if (request.reviewer?.email) {
          const subject = "You Earned Joy Pearls for Reviewing a Request";
          const htmlContent = `
            <p>Hello ${request.reviewer.name || "Reviewer"},</p>
            <p>Thank you for reviewing the BuddyLens request in ${request.domain}. You have earned ${jpCost} Joy Pearls.</p>
            <p><a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard/buddy-lens/reviewer/${request.id}">View Review</a></p>
          `;
          await sendEmail(
            request.reviewer.email,
            request.reviewer.name || "Reviewer",
            subject,
            htmlContent,
            request.reviewer.name || "MyThriveBuddy"
          );
        }
      }

      return review;
    });

    return NextResponse.json(
      { message: "Review submitted", data: newReview },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review submission error:", error);
    const apiError = error as ApiError;
    return NextResponse.json({
      success: false,
      error: apiError?.message || "Unknown error",
      status: apiError?.response?.status || 500,
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return errorResponse("Please log in", 401);
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      const review = await prisma.buddyLensReview.findUnique({
        where: { id },
        include: { request: { select: { requesterId: true, domain: true } } },
      });

      if (!review) {
        return errorResponse("Review not found", 404);
      }
      if (
        review.reviewerId !== session.user.id &&
        review.request.requesterId !== session.user.id
      ) {
        return errorResponse("Unauthorized to view this review", 403);
      }

      return NextResponse.json(review);
    }

    const reviews = await prisma.buddyLensReview.findMany({
      where: {
        // OR: [
        // { reviewerId: session.user.id },
        request: { requesterId: session.user.id },
        // ],
      },
      include: {
        request: { select: { domain: true } },
        reviewer: {
          select: { email: true, name: true, jpBalance: true, plan: true },
        },
      },
    });

    console.log(
      "request-----------------------------------------------------------",
      reviews
    );

    return NextResponse.json(reviews);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Email sending failed:", error.message);
      const apiError = error as ApiError;
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

interface UpdateReviewBody {
  answers?: string[];
  reviewText?: string;
  rating?: number;
  feedback?: string;
  status?: "SUBMITTED" | "DRAFT";
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return errorResponse("Please log in", 401);
    }

    const searchParams = req.nextUrl.searchParams;
    // const id = searchParams.get('id');
    const id = searchParams.get("requestId");

    if (!id) {
      return errorResponse("Review ID is required", 400);
    }

    const { answers, reviewText, rating, feedback, status } =
      (await req.json()) as UpdateReviewBody;

    if (rating && (rating < 1 || rating > 5)) {
      return errorResponse("Rating must be between 1 and 5", 400);
    }
    if (answers && !Array.isArray(answers)) {
      return errorResponse("Answers must be an array", 400);
    }
    if (status && !["SUBMITTED", "DRAFT"].includes(status)) {
      return errorResponse("Invalid status", 400);
    }

    const review = await prisma.buddyLensReview.findUnique({
      where: { id },
      select: { reviewerId: true, requestId: true },
    });

    if (!review) {
      return errorResponse("Review not found", 404);
    }
    if (review.reviewerId !== session.user.id) {
      return errorResponse("Unauthorized to update this review", 403);
    }

    const updateData = {
      ...(answers && { answers }),
      ...(reviewText && { reviewText }),
      ...(rating && { rating }),
      ...(feedback && { feedback }),
      ...(status && { status }),
      ...(status === "SUBMITTED" && { submittedAt: new Date() }),
    };

    const updatedReview = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.buddyLensReview.update({
        where: { id },
        data: updateData,
      });

      if (status === "SUBMITTED") {
        const updatedRequest = await prisma.buddyLensRequest.update({
          where: { id: review.requestId },
          data: { status: "COMPLETED", completedAt: new Date() },
          include: {
            requester: { select: { email: true, name: true } },
            reviewer: { select: { email: true, name: true } },
          },
        });

        if (updatedRequest.requester.email) {
          const baseUrl =
            process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
          const reviewUrl = `${baseUrl}/dashboard/buddy-lens/requester?requestId=${review.requestId}`;
          const subject = "BuddyLens Request Reviewed";
          const htmlContent = `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #4F46E5;">BuddyLens Request Reviewed</h1>
                  </div>
                  <p>Hello ${updatedRequest.requester.name || "User"},</p>
                  <p>Your BuddyLens request in ${updatedRequest.domain} has been reviewed by ${updatedRequest.reviewer?.name || "a reviewer"}.</p>
                  <p>View the review at: <a href="${reviewUrl}">View Review</a></p>
                  <p>Thank you,<br>The MyThriveBuddy Team</p>
                </div>
              </body>
            </html>
          `;

          const emailResult = await sendEmail(
            updatedRequest.requester.email,
            updatedRequest.requester.name || "User",
            subject,
            htmlContent,
            updatedRequest.reviewer?.name || "MyThriveBuddy"
          );

          if (!emailResult.success) {
            console.error(
              `Failed to send review completion email: ${emailResult.error}`
            );
          }
        }
      }

      return updated;
    });

    return NextResponse.json({
      message: "Review updated",
      data: updatedReview,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    // if (error instanceof prisma.PrismaClientValidationError) {
    //   return errorResponse("Invalid request data", 400);
    // }
    return errorResponse("Failed to update review", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return errorResponse("Please log in", 401);
    }

    const { requestId, reviewerId }: { requestId: string; reviewerId: string } =
      await req.json();
    if (!requestId || !reviewerId) {
      return errorResponse("Missing request ID or reviewer ID", 400);
    }

    if (reviewerId !== session.user.id) {
      return errorResponse("Unauthorized reviewer ID", 403);
    }

    const request = await prisma.buddyLensRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        requesterId: true,
        requester: { select: { email: true, name: true } },
        status: true,
        // pendingReviewerId: true,
        review: {
          //?9may
          include: {
            reviewer: {
              omit: { password: true },
            },
          },
        },
        domain: true,
        isDeleted: true,
        reviewerId: true,
        reviewer: {
          omit: { password: true },
        },
      },
    });
    console.log("request", request);
    if (!request || request.isDeleted) {
      return errorResponse("Request not found", 404);
    }
    if (request.status !== "OPEN" || request.reviewerId) {
      //?9may
      return errorResponse("Request is not open", 400);
    }
    if (request.requesterId === reviewerId) {
      return errorResponse("Cannot claim your own request", 403);
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: { id: true, name: true, email: true },
    });

    if (!reviewer) {
      return errorResponse("Reviewer not found", 404);
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const approvalUrl = `${baseUrl}/dashboard/buddy-lens/approve?requestId=${requestId}&reviewerId=${reviewerId}`;

    // Prepare email content for requester to approve or reject claim request
    const subject = "BuddyLens Review Request Claim Notification";
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4F46E5;">Review Request Claim Notification</h1>
            </div>
            <p>Hello ${request.requester.name || "User"},</p>
            <p>This is to inform you that <strong>${reviewer.name || "A reviewer"}</strong> has claimed your review request in ${request.domain}.</p>
            <p>Please approve or reject this claim by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Review Claim</a>
            </div>
            <p>If you did not expect this notification, please ignore this email or contact support.</p>
            <p>Thank you,<br>The MyThriveBuddy Team</p>
          </div>
        </body>
      </html>
    `;

    // Initialize with default values that match the return type of sendEmail
    let emailResult: {
      success: boolean;
      messageId?: string;
      error?: string | Error;
      status?: number | string;
    } = {
      success: false,
      error: "Email not sent yet",
    };

    const updatedRequest = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.buddyLensRequest.update({
        where: { id: requestId },
        data: {
          review: {
            create: {
              reviewerId: reviewerId,
              status: "PENDING",
              reviewText: "",
            },
          },
        },
      });

      // const notificationLink = `/dashboard/buddy-lens/approve?requestId=${requestId}&reviewerId=${reviewerId}`;
      await createBuddyLensClaimedNotification(
        request.requesterId,
        reviewer.name || "A reviewer",
        request.domain,
        requestId
      );

      // Send email within transaction if email exists
      if (request.requester.email) {
        try {
          emailResult = await sendEmail(
            request.requester.email,
            request.requester.name || "User",
            subject,
            htmlContent,
            reviewer.name || "MyThriveBuddy"
          );

          if (!emailResult.success) {
            console.error(
              `Failed to send claim notification email within transaction: ${emailResult.error}`
            );
          } else {
            console.log(
              "Claim notification email sent successfully within transaction"
            );
          }
        } catch (error) {
          console.error("Transaction email sending failed:", error);
          // We continue with the transaction even if email fails
        }
      } else {
        console.warn(
          "No email address found for requester ID:",
          request.requesterId
        );
      }

      return updated;
    });

    // If email failed within transaction and requester has email, try once more outside transaction
    if (!emailResult.success && request.requester.email) {
      try {
        console.log("Retrying email sending outside transaction...");
        emailResult = await sendEmail(
          request.requester.email,
          request.requester.name || "User",
          subject,
          htmlContent,
          reviewer.name || "MyThriveBuddy"
        );

        if (emailResult.success) {
          console.log("Claim notification email sent successfully on retry");
        } else {
          console.error(
            `Failed to send claim notification email on retry: ${emailResult.error}`
          );
        }
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

    return NextResponse.json({
      message:
        "Claim submitted" +
        (emailResult.success ? " and notification email sent" : ""),
      data: updatedRequest,
      emailSent: emailResult.success,
    });
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
