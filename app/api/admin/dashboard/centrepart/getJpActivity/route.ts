// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

// export async function GET(req: Request) {
//   const session = await getServerSession(authConfig);

//   // Verify admin access
//   if (!session || session.user.role !== "ADMIN") {
//     //change it to admin
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   try {
//     /**
//       SUMIRAN BHAWSAR

//      * (distributed, spent, and balance) for users, optionally filtered by a date range specified
//      * via the `range` query parameter. Supported range values are:
//      * - "all": No date filter (default)
//      * - "7": Last 7 days
//      * - "15": Last 15 days
//      * - "30": Last 30 days
//      */
//     const url = new URL(req.url);
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

//     // end here

//     /**
//      * previous part
//     */
//     // Fetch transactions with optional date filter
//     // const allTransactionsData = await prisma.transaction.findMany({
//     //   where: {
//     //     ...(dateFilter ? { createdAt: dateFilter } : {}),
//     //   },
//     //   orderBy: {
//     //     createdAt: "desc",
//     //   },
//     // });

//     // const totalJpBalance = await prisma.transaction.aggregate({
//     //   _sum: {
//     //     jpAmount: true,
//     //   },
//     //   where: {

//     //   },
//     // });

//     // console.log(`Total JP Balance: ${totalJpBalance._sum.jpAmount}`);
    

//     /**
//       SUMIRAN BHAWSAR

//      * Aggregates user data from the database, filtered by role "USER" and an optional creation date filter.
//      * Orders the results by the most recently created users.
//      * Computes the sum of the `jpEarned`, `jpSpent`, and `jpBalance` fields across all matching users.
//      *
//      * @returns An object containing the summed values of `jpEarned`, `jpSpent`, and `jpBalance` for the filtered users.

//     */
//     const totals = await prisma.user.aggregate({
//       where: {
//         role: "USER",
//         ...(dateFilter ? { createdAt: dateFilter } : {}),
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       _sum: {
//         jpEarned: true,
//         jpSpent: true,
//         jpBalance: true,
//       },
//     });

//     // End here

//     return NextResponse.json({
//       totalJpDistributed: totals._sum.jpEarned || 0,
//       totalJpSpent: totals._sum.jpSpent || 0,
//       totalJpBalance: totals._sum.jpBalance || 0,
//     });
//   } catch (error) {
//     console.error("Error fetching JP totals:", error);
//     return NextResponse.json(
//       { message: "Error fetching JP totals" },
//       { status: 500 }
//     );
//   }
// }

// sumiran bhawsar

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");

    let dateFilter = {};

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      // Include full day for toDate by setting time to end of the day
      to.setHours(23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          gte: from,
          lte: to,
        },
      };
    }

    const totals = await prisma.user.aggregate({
      where: {
        role: "USER",
        ...(Object.keys(dateFilter).length ? dateFilter : {}),
      },
      _sum: {
        jpEarned: true,
        jpSpent: true,
        jpBalance: true,
      },
    });

    return NextResponse.json({
      totalJpDistributed: totals._sum.jpEarned || 0,
      totalJpSpent: totals._sum.jpSpent || 0,
      totalJpBalance: totals._sum.jpBalance || 0,
    });
  } catch (error) {
    console.error("Error fetching JP totals:", error);
    return NextResponse.json(
      { message: "Error fetching JP totals" },
      { status: 500 }
    );
  }
}
