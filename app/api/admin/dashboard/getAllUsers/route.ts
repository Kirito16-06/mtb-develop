// /api/admin/dashboard/getAllUsers.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "6", 10);
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Verify admin access
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let whereClause = {};

  // Apply filters based on the query parameter
  if (filter === "blocked") {
    // Filter for blocked users (assuming a boolean field "isBlocked" exists)
    whereClause = { isBlocked: true, role: "USER" };
  } else if (filter === "new") {
    // Filter for new users (signed up within the last week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    whereClause = { createdAt: { gte: oneWeekAgo }, role: "USER" };
  } else if (filter === "all") {
    whereClause = { role: "USER" };
  }

  // If a search term is provided, add a search filter (example: search in name or email)
  if (search.trim()) {
    whereClause = {
      ...whereClause,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  try {
    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        jpEarned: true,
        jpBalance: true,
        createdAt: true,
        isBlocked: true,  
        plan: { select: { name: true } },
        isOnline:true,
      },
      orderBy: { createdAt:"desc" },
    });

    const totalUsers = await prisma.user.count({ where: whereClause });
    const total = Math.ceil(totalUsers / pageSize);

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
