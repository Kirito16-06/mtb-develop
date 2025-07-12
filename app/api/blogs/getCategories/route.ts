import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    // Query distinct categories from the blog posts
    const categories = await prisma.blog.findMany({
      distinct: ["category"],
      select: { category: true },
    });

    // Map the results to an array of strings
    const categoryList = categories.map((entry) => entry.category);

    return NextResponse.json({ categories: categoryList });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
