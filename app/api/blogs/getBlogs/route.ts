import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

type whereProps = Prisma.BlogWhereInput;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    // page & limit (admin or user can override)
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "6"), 1),
      100
    );
    const skip = (page - 1) * limit;

    // optional filters
    const where: whereProps = {};
    if (searchParams.get("search")) {
      where.title = {
        contains: searchParams.get("search")!,
        mode: "insensitive",
      };
    }
    if (searchParams.get("category")) {
      where.category = searchParams.get("category")!;
    }

    // atomically get count + page of blogs
    const [totalCount, blogs] = await prisma.$transaction([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          excerpt: true,
          image: true,
          category: true,
          content: true,
          readTime: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Blogs retrieved successfully",
      blogs,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error("Blog API Error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to fetch blogs", message },
      { status: 500 }
    );
  }
}
