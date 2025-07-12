import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const itemId = url.searchParams.get("itemId");

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        basePrice: item.basePrice,
        monthlyPrice: item.monthlyPrice,
        yearlyPrice: item.yearlyPrice,
        lifetimePrice: item.lifetimePrice,
        category: {
          id: item.category.id,
          name: item.category.name,
        },
      },
    });
  } catch (error) {
    console.error("[ITEM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 