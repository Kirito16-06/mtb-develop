import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

// DELETE: Remove Item from Cart
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cartItemId } = body;
    console.log("Deleting cart item:", cartItemId);

    if (!cartItemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get the cart item to check if it was in wishlist
    const cartItem = await prisma.cart.findUnique({
      where: { 
        id: cartItemId,
        userId: session.user.id,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    console.log("Cart item found:", cartItem);

    // Delete the cart item
    await prisma.cart.delete({
      where: { 
        id: cartItemId,
        userId: session.user.id,
      },
    });

    // If the item was in wishlist, add it back
    if (cartItem.wasInWishlist) {
      console.log("Adding back to wishlist:", cartItem.itemId);
      await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          itemId: cartItem.itemId,
        },
      });
    }

    return NextResponse.json(
      { message: "Item removed from cart" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}