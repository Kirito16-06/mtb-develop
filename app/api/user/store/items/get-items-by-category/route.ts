import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Fetch items from Prisma
    const items = await prisma.item.findMany({
      where: { categoryId: category },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
