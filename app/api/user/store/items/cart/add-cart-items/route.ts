import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

// POST: Add Item to Cart
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authConfig);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { itemId, wasInWishlist } = body;
        console.log("Adding to cart:", { itemId, wasInWishlist });

        if (!itemId || typeof itemId !== "string") {
            return NextResponse.json({ error: "Item ID is required and must be a string" }, { status: 400 });
        }

        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        const existingCartItem = await prisma.cart.findFirst({
            where: { userId: session.user.id, itemId },
        });

        if (existingCartItem) {
            return NextResponse.json({ message: "Item already in cart" }, { status: 400 });
        }

        const newCartItem = await prisma.cart.create({
            data: {
                userId: session.user.id,
                itemId,
                wasInWishlist: wasInWishlist || false,
            },
        });

        console.log("Created cart item:", newCartItem);
        return NextResponse.json({ cartItem: newCartItem }, { status: 201 });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}