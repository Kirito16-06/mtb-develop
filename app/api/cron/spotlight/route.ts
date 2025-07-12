import { checkAndRotateSpotlight } from "@/lib/utils/spotlight";
import {  NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to ensure only authorized calls are made
    // * vercel automcatically add this to Auth header when it invokes the cron job

    //?dev - commented for tesing in dev
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run the spotlight rotation check
    await checkAndRotateSpotlight();

    // Return success response
    return NextResponse.json( 
      {
        success: true,
        message: "Spotlight rotation check completed",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Spotlight rotation error:", error);
    return NextResponse.json(
      {
        error: "Failed to process spotlight rotation",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}
