import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's internal ID from Clerk's external ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Fetch orders with items and their details
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map((orderItem) => ({
          id: orderItem.id,
          quantity: orderItem.quantity,
          priceAtPurchase: orderItem.priceAtPurchase,
          item: {
            id: orderItem.item.id,
            name: orderItem.item.name,
            imageUrl: orderItem.item.imageUrl,
            basePrice: orderItem.item.basePrice,
            monthlyPrice: orderItem.item.monthlyPrice,
            yearlyPrice: orderItem.item.yearlyPrice,
            lifetimePrice: orderItem.item.lifetimePrice,
            category: orderItem.item.category,
          },
        })),
      })),
    });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
