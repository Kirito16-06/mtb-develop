import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pureId = id.split("-")[0];
 
  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id: pureId,
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        image: true,
        content: true,
        category: true,
        readTime: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
