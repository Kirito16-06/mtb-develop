import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { sendEmailUsingTemplate } from "@/utils/sendEmail";
// This endpoint can be called by a CRON job service (e.g., Vercel Cron)
// It should be scheduled to run every 5 minutes
export async function GET(req:NextRequest) {
  try {
    // Get authorization token from request headers
    const authHeader = req.headers.get("authorization");
    
    // // Basic auth check for cron job
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get current time
    const now = new Date();
    const fiveMinutesFromNow = addMinutes(now, 5);
    
    // Find actions that start in the next 5 minutes and haven't had reminders sent
    const upcomingActions = await prisma.alignedAction.findMany({
      where: {
        timeFrom: {
          gte: now,
          lte: fiveMinutesFromNow,
        },
        reminderSent: false,
        completed: false,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
    
    console.log(`Found ${upcomingActions.length} upcoming actions that need reminders`);
    
    // Send reminders for each upcoming action
    const results = await Promise.allSettled(
      upcomingActions.map(async (action) => {
        try {
          if (action.user && action.user.email) {
            // Use Resend or other email service
            // Replace with your actual email sending logic
            // const emailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/send`, {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            //   body: JSON.stringify({
            //     to: action.user.email,
            //     subject: "Reminder: Your aligned action starts soon",
            //     html: `<div>
            //       <h2>Hello ${action.user.name},</h2>
            //       <p>Your aligned action is scheduled to start in 5 minutes!</p>
            //       <p><strong>Task:</strong> ${action.selectedTask}</p>
            //       <p><strong>Category:</strong> ${action.category}</p>
            //       <p><strong>Time:</strong> ${new Date(action.timeFrom).toLocaleTimeString()} - ${new Date(action.timeTo).toLocaleTimeString()}</p>
            //       <p>Log in to your dashboard to mark your progress!</p>
            //     </div>`,
            //   }),
            // });
            
            // if (!emailRes.ok) {
            //   throw new Error("Failed to send email");
            // }
            await sendEmailUsingTemplate({
              toEmail: action.user.email,
              toName: action.user.name,
              templateId: "reminder-aligned-actions",
              templateData: {
                username: action.user.name,
                insert_time: action.timeFrom,
              },
            });
            
            // Mark the reminder as sent
            await prisma.alignedAction.update({
              where: { id: action.id },
              data: { reminderSent: true },
            });
            
            return { success: true, actionId: action.id };
          }
          return { success: false, actionId: action.id, error: "No user email found" };
        } catch (error) {
          console.error(`Error sending reminder for action ${action.id}:`, error);
          return { success: false, actionId: action.id, error };
        }
      })
    );
    
    // Count successes and failures
    const successes = results.filter((result) => result.status === "fulfilled" && (result.value).success).length;
    const failures = results.length - successes;
    
    return NextResponse.json({
      message: `Processed ${upcomingActions.length} reminders`,
      successes,
      failures,
    });
  } catch (error) {
    console.error("Error processing reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 