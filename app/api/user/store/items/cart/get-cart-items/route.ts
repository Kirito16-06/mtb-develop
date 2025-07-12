import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

// GET: Fetch User's Cart
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await prisma?.cart.findMany({
      where: { userId: session.user.id },
      include: { item: true },
    });

    return NextResponse.json({ cart: cartItems }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
