import { NextResponse } from "next/server";
import { checkRole } from "@/lib/utils/auth";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await checkRole("ADMIN", "You are not authorized for this action");

    // Fetch all activities
    const activities = await prisma.activity.findMany({
      orderBy: {
        activity: "asc",
      },
    });

    // console.log(
    //   `all activities from admin/activity/list : ${activities.map((val) =>
    //     console.log(val)
    //   )}`
    // );

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }

}
