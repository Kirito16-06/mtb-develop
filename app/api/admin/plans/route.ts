import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";

// GET /api/admin/plans - Get all plans
export async function GET() {
  try {
    await checkRole("ADMIN");

    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/plans - Update plan
export async function PUT(request: Request) {
  try {
    await checkRole("ADMIN");

    const body = await request.json();
    const { id, jpMultiplier, discountPercent } = body;

    if (
      !id ||
      typeof jpMultiplier !== "number" ||
      typeof discountPercent !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        jpMultiplier,
        discountPercent,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
