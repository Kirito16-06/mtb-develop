import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";
import { assignJp } from "@/lib/utils/jp";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]/auth.config";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type RequestBody = {
  formData: FormData;
  captchaToken: string;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body: RequestBody = await request.json();
    const { formData, captchaToken } = body;
    const { name, email, subject, message } = formData;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Captcha verification
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) throw new Error("Missing RECAPTCHA_SECRET_KEY");
    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const verificationResponse = await axios.post(verifyUrl, null, {
      params: { secret, response: captchaToken },
    });
    if (!verificationResponse.data.success) {
      return NextResponse.json(
        { message: "Captcha verification failed" },
        { status: 400 }
      );
    }

    // Check if user is logged in and assign JP points
    let jpMessage = "";
    try {
      const session = await getServerSession(authConfig);
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { plan: true },
        });

        if (user) {
          let activityType: ActivityType;
          let jpAmount: number;
          
          // Get the current JP amounts from the activity table
          const activityData = await prisma.activity.findUnique({
            where: { activity: ActivityType.GENERAL_FEEDBACK },
          });

          switch (subject.toLowerCase()) {
            case "general":
              activityType = ActivityType.GENERAL_FEEDBACK;
              jpAmount = activityData?.jpAmount || 50;
              break;
            case "feature":
              activityType = ActivityType.FEATURE_REQUEST;
              const featureActivity = await prisma.activity.findUnique({
                where: { activity: ActivityType.FEATURE_REQUEST },
              });
              jpAmount = featureActivity?.jpAmount || 100;
              break;
            case "bug":
              activityType = ActivityType.BUG_REPORT;
              const bugActivity = await prisma.activity.findUnique({
                where: { activity: ActivityType.BUG_REPORT },
              });
              jpAmount = bugActivity?.jpAmount || 150;
              break;
            default:
              activityType = ActivityType.GENERAL_FEEDBACK;
              jpAmount = activityData?.jpAmount || 50;
          }

          await assignJp(user, activityType);
          jpMessage = ` You've earned ${jpAmount} Joy Pearls for your ${subject} feedback!`;
        }
      }
    } catch (jpError) {
      console.error("JP points assignment error:", jpError);
      // Continue with email sending even if JP assignment fails
    }

    // Prepare email payloads
    const senderEmail = process.env.CONTACT_SENDER_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;
    const brevoApiKey = process.env.BREVO_API_KEY;
    
    if (!senderEmail || !adminEmail || !brevoApiKey) {
      throw new Error("Missing necessary environment variables");
    }

    const brevoApiUrl = "https://api.brevo.com/v3/smtp/email";
    const headers = {
      "Content-Type": "application/json",
      "api-key": brevoApiKey,
    };

    const thankYouEmailPayload = {
      sender: { email: senderEmail },
      to: [{ email, name }],
      subject: "Thank you for contacting MyThriveBuddy",
      htmlContent: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f0f4f8; border-radius: 12px;">
    <div style="background-color: #ffffff; padding: 25px 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #1E2875; font-size: 24px; margin-bottom: 20px;">Hello ${name},</h2>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
        Thank you for reaching out to <strong>MyThriveBuddy</strong>. We've received your message and our team will get back to you as soon as possible.
      </p>

      ${jpMessage ? `
        <div style="background-color: #e6ffed; padding: 16px; border-radius: 8px; border-left: 5px solid #38a169; margin-top: 20px;">
          <p style="color: #276749; margin: 0; font-size: 15px;">
            ${jpMessage}
          </p>
        </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #a0aec0; font-size: 13px;">
          This is an automated message from MyThriveBuddy. Please do not reply to this email.
        </p>
        <p style="color: #a0aec0; font-size: 13px; margin-top: 5px;">
          © ${new Date().getFullYear()} MyThriveBuddy.com
        </p>
      </div>
    </div>
  </div>
`,

    };

    const adminEmailPayload = {
      sender: { email: senderEmail },
      to: [{ email: adminEmail }],
      subject: `New Contact Form Submission: ${subject}`,
      htmlContent: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f0f4f8; border-radius: 12px;">
    <div style="background-color: #ffffff; padding: 25px 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #1E2875; font-size: 24px; margin-bottom: 20px;">📥 New Contact Form Submission</h2>
      
      <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #edf2f7; margin-bottom: 20px;">
        <p style="color: #2d3748; margin-bottom: 10px; font-size: 15px;">
          <strong>From:</strong> ${name} (${email})
        </p>
        <p style="color: #2d3748; margin-bottom: 10px; font-size: 15px;">
          <strong>Subject:</strong> ${subject}
        </p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 15px;">
          <p style="color: #4a5568; margin: 0; white-space: pre-wrap; font-size: 15px;">
            ${message}
          </p>
        </div>
      </div>

      ${jpMessage ? `
        <div style="background-color: #e6ffed; padding: 16px; border-radius: 8px; border-left: 5px solid #38a169; margin-top: 20px;">
          <p style="color: #276749; margin: 0; font-size: 15px;">
            ✅ User earned Joy Pearls for this feedback: <strong>${jpMessage}</strong>
          </p>
        </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #718096; font-size: 13px;">
          📅 Received at: ${new Date().toLocaleString()}
        </p>
        <p style="color: #a0aec0; font-size: 12px; margin-top: 5px;">
          This is an automated notification from <strong>MyThriveBuddy</strong>.
        </p>
      </div>
    </div>
  </div>
`

    };

    // Send emails
    try {
      await axios.post(brevoApiUrl, thankYouEmailPayload, { headers });
      await axios.post(brevoApiUrl, adminEmailPayload, { headers });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { message: "Failed to send emails. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: `Your message has been sent successfully!${jpMessage}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
