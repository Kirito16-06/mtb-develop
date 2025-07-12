import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Access params from context

  const buddyRequest = await prisma.buddyLensReview.findUnique({
    where: { id },
    include: { request: true, reviewer: true },
  });

  if (!buddyRequest || !buddyRequest) {
    return NextResponse.json({ message: "Review not found" }, { status: 404 });
  }

  return NextResponse.json(buddyRequest); // Only return the review
}
