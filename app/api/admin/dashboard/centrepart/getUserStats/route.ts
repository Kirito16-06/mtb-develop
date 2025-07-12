// import { getServerSession } from "next-auth";
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";
// import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

// export async function GET(request: Request) {
//   // Verify admin access
//   const session = await getServerSession(authConfig);
//   if (!session || session.user.role !== "ADMIN") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   try {
//     /**
//       SUMIRAN BHAWSAR & Lucky Giri

//      * (distributed, spent, and balance) for users, optionally filtered by a date range specified
//      * via the `range` query parameter. Supported range values are:
//      * - "all": No date filter (default)
//      * - "7": Last 7 days
//      * - "15": Last 15 days
//      * - "30": Last 30 days
//     */
//     const url = new URL(request.url);
//     const range = url.searchParams.get("range"); // expected values: "all", "7", "15", "30"

//     const now = new Date();
//     let dateFilter = undefined;

//     if (range === "7") {
//       const sevenDaysAgo = new Date(now);
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//       dateFilter = { gte: sevenDaysAgo };
//     } else if (range === "15") {
//       const fifteenDaysAgo = new Date(now);
//       fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
//       dateFilter = { gte: fifteenDaysAgo };
//     } else if (range === "30") {
//       const oneMonthAgo = new Date(now);
//       oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
//       dateFilter = { gte: oneMonthAgo };
//     }

//     // End here

//     // Get total user count
//     const totalUsers = await prisma.user.count({
//       where: { role: "USER" },
//     });

//     {/* Previous code for date filter only 7 days */}
//     // Get recent signups (last 7 days)
//     // const lastWeek = new Date();
//     // lastWeek.setDate(lastWeek.getDate() - 7);
//     // const recentSignups = await prisma.user.count({
//     //   where: { createdAt: { gte: lastWeek } },
//     // });

//     /**
//       SUMIRAN BHAWSAR

//      * Aggregates the count of users with the role "USER" who have signed up recently,
//      * optionally filtered by a specified creation date range (`dateFilter`).
//      * The results are ordered by the `createdAt` timestamp in descending order.
//      *
//      * @remarks
//      * Utilizes Prisma's aggregate function to count user records matching the criteria.
//      *
//      * @param dateFilter - Optional filter to restrict users by their `createdAt` date.
//      * @returns An object containing the count of users (`_count.id`) matching the filters.

//     */
//     const recentSignups = await prisma.user.aggregate({
//       where: {
//         role: "USER",
//         ...(dateFilter ? { createdAt: dateFilter } : {}),
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       _count: {
//         id: true
//       }
//     });

//     // End here

//     // console.log(response);

//     // Get blocked users count
//     const blockedUsers = await prisma.user.count({
//       where: { isBlocked: true },
//     });

//     return NextResponse.json(
//       {
//         totalUsers,
//         recentSignups: recentSignups._count.id, // new change by sumiran
//         blockedUsers,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error fetching user stats:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    /**
      SUMIRAN BHAWSAR & Lucky Giri

     * (distributed, spent, and balance) for users, optionally filtered by a date range specified
     * via the `range` query parameter. Supported range values are:
     * - "all": No date filter (default)
     * - "7": Last 7 days
     * - "15": Last 15 days
     * - "30": Last 30 days
    */
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");

    let dateFilter = {};

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // Include full toDate day

      dateFilter = {
        createdAt: {
          gte: from,
          lte: to,
        },
      };
    }

    // Total users with role USER
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    // Recent signups within provided date range (if both dates provided)
    /**
      SUMIRAN BHAWSAR

     * Aggregates the count of users with the role "USER" who have signed up recently,
     * optionally filtered by a specified creation date range (`dateFilter`).
     * The results are ordered by the `createdAt` timestamp in descending order.
     *
     * @remarks
     * Utilizes Prisma's aggregate function to count user records matching the criteria.
     *
     * @param dateFilter - Optional filter to restrict users by their `createdAt` date.
     * @returns An object containing the count of users (`_count.id`) matching the filters.

    */

    const recentSignupsAggregate = await prisma.user.aggregate({
      where: {
        role: "USER",
        ...(Object.keys(dateFilter).length ? dateFilter : {}),
      },
      _count: { id: true },
    });
    const recentSignups = recentSignupsAggregate._count.id;

    // Blocked users count
    const blockedUsers = await prisma.user.count({
      where: { isBlocked: true },
    });

    return NextResponse.json(
      {
        totalUsers,
        recentSignups,
        blockedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
