import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid cartItemId or quantity" },
        { status: 400 }
      );
    }

    const updatedCartItem = await prisma.cart.update({
      where: {
        id: cartItemId,
        userId, // Ensure the cart item belongs to the user
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({
      message: "Quantity updated successfully",
      cartItem: updatedCartItem,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}