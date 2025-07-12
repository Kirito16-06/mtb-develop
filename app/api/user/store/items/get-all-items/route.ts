import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Item } from "@prisma/client";

export async function GET(): Promise<NextResponse> {
  try {
    const items: Item[] = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error('Error fetching store items:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch items' }, { status: 500 });
  }
}
