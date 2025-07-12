import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";
import { activityDisplayMap } from "@/lib/constants/activityNames";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "6");
  const skip = (page - 1) * limit;
  const session = await checkRole("USER");
  const userId = session.user.id;

  try {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        include: { activity: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const currentPage = page > totalPages ? totalPages : page;

    const formattedTransactions = transactions.map((tx) => ({
      ...tx,
      activity: {
        ...tx.activity,
        displayName:
          activityDisplayMap[tx.activity.activity] || tx.activity.activity,
      },
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      total,
      page: currentPage,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
