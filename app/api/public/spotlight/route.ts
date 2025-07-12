import { SpotlightStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activeSpotlight = await prisma.spotlight.findFirst({
      where: {
        // isActive: true,
        status: SpotlightStatus.ACTIVE,
        // ? cron jobs will take care of this
        // expiresAt: {
        //   gt: new Date(), // Not expired
        // },
      },
      select: {
        id: true,
        expiresAt: true,
        user: {
          omit: {
            password: true,
          },
          include: {
            userBusinessProfile: true,
          }
        },
      },
    });

    console.log("activeSpotlight", activeSpotlight); //?dev

    // If no active spotlight found, return null
    if (!activeSpotlight) {
      return NextResponse.json(null);
    }

    return NextResponse.json(activeSpotlight);
  } catch (error) {
    console.error("Error fetching active spotlight:", error);
    return NextResponse.json(
      { error: "Failed to fetch active spotlight" },
      { status: 500 }
    );
  }
}
