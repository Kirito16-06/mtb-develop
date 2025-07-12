import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";

export async function GET() {
  const session = await getServerSession(authConfig)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: { item: true },
    });
console.log("wishlist",wishlist)
    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig) as { user: { id: string; name?: string | null; email?: string | null; image?: string | null } } | null;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId }: { itemId: string } = await req.json();

    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: session.user.id,
        itemId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Item already in wishlist" },
        { status: 400 }
      );
    }

    const newWishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        itemId,
      },
    });

    return NextResponse.json({ wishlistItem: newWishlistItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authConfig) as { user: { id: string; name?: string | null; email?: string | null; image?: string | null } } | null;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId }: { itemId: string } = await req.json();

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        itemId,
      },
    });

    return NextResponse.json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}