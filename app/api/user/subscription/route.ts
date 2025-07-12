import { NextRequest, NextResponse } from "next/server";
import { checkRole } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for subscription request validation
const subscriptionSchema = z.object({
  planId: z.string().uuid(),
  price: z.string(), // Price paid by the user
});

// Determine the current Lifetime tier based on user count
async function getCurrentLifetimePlan() {
  const lifetimePlanUsers = await prisma.user.count({
    where: {
      plan: {
        name: {
          startsWith: "Lifetime Plan",
        },
      },
    },
  });

  let tierName: string;
  let defaultPrice: string;

  if (lifetimePlanUsers < 10) {
    tierName = "Lifetime Plan Tier-1";
    defaultPrice = "499";
  } else if (lifetimePlanUsers < 20) {
    tierName = "Lifetime Plan Tier-2";
    defaultPrice = "699";
  } else if (lifetimePlanUsers < 30) {
    tierName = "Lifetime Plan Tier-3";
    defaultPrice = "999";
  } else if (lifetimePlanUsers < 40) {
    tierName = "Lifetime Plan Tier-4";
    defaultPrice = "1399";
  } else if (lifetimePlanUsers < 50) {
    tierName = "Lifetime Plan Tier-5";
    defaultPrice = "1899";
  } else {
    tierName = "Lifetime Plan Standard";
    defaultPrice = "2999";
  }

  const plan = await prisma.plan.findFirst({
    where: { name: tierName, isActive: true },
    select: { id: true, name: true, price: true, paypalPlanId: true },
  });

  // Fetch all Lifetime tiers for the Claim Spot section
  const lifetimeTiers = await prisma.plan.findMany({
    where: {
      name: {
        startsWith: "Lifetime Plan",
      },
      isActive: true,
    },
    select: { id: true, name: true, price: true, paypalPlanId: true },
    orderBy: { price: "asc" },
  });

  // Define user ranges for each tier
  const userRanges: Record<string, string> = {
    "Lifetime Plan Tier-1": "1-10",
    "Lifetime Plan Tier-2": "11-20",
    "Lifetime Plan Tier-3": "21-30",
    "Lifetime Plan Tier-4": "31-40",
    "Lifetime Plan Tier-5": "41-50",
    "Lifetime Plan Standard": "51+",
  };

  return {
    planId: plan?.id,
    planName: plan?.name || tierName,
    price: plan?.price || defaultPrice,
    paypalPlanId: plan?.paypalPlanId,
    lifetimePlanUsers,
    limitedOfferAvailable: lifetimePlanUsers < 50,
    lifetimeTiers: lifetimeTiers.map((tier) => {
      const tierNumberMatch = tier.name.match(/Tier-(\d+)/);
      const tierNumber = tierNumberMatch ? parseInt(tierNumberMatch[1]) : null;
      return {
        tier: tier.name.includes("Standard")
          ? "Standard"
          : `Tier ${tierNumber || ""}`,
        planId: tier.id,
        planName: tier.name,
        price: tier.price,
        paypalPlanId: tier.paypalPlanId,
        userRange: userRanges[tier.name] || "Unknown",
      };
    }),
  };
}

// GET: Fetch the current user's subscription and available plans
export async function GET() {
  try {
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plans = await prisma.plan.findMany({
      where: { isActive: true },
    });

    const currentLifetimePlan = await getCurrentLifetimePlan();

    // Validate that currentLifetimePlan has valid data
    if (!currentLifetimePlan.planId || !currentLifetimePlan.paypalPlanId) {
      console.error(`Plan not found for tier: ${currentLifetimePlan.planName}`);
      return NextResponse.json(
        {
          error: `Plan configuration error for ${currentLifetimePlan.planName}`,
        },
        { status: 500 }
      );
    }

    const hasActiveSubscription =
      !!user.planId &&
      (user.planEnd === null || new Date(user.planEnd) > new Date());

    return NextResponse.json({
      currentPlan: user.plan,
      planStart: user.planStart,
      planEnd: user.planEnd,
      hasActiveSubscription,
      plans,
      currentLifetimePlan: {
        planId: currentLifetimePlan.planId,
        planName: currentLifetimePlan.planName,
        price: currentLifetimePlan.price,
        paypalPlanId: currentLifetimePlan.paypalPlanId,
      },
      lifetimePlanUsers: currentLifetimePlan.lifetimePlanUsers,
      limitedOfferAvailable: currentLifetimePlan.limitedOfferAvailable,
      lifetimeTiers: currentLifetimePlan.lifetimeTiers,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// POST: Create or update a subscription
export async function POST(req: NextRequest) {
  try {
    const session = await checkRole(
      "USER",
      "You are not authorized for this action"
    );

    const body = await req.json();
    const parseResult = subscriptionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    const { planId } = parseResult.data;

    const planRecord = await prisma.plan.findUnique({
      where: { id: planId },
    });
    if (!planRecord) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tierMap: Record<string, number> = {
      "Monthly Plan": 1,
      "Yearly Plan": 2,
      "Lifetime Plan Tier-1": 3,
      "Lifetime Plan Tier-2": 3,
      "Lifetime Plan Tier-3": 3,
      "Lifetime Plan Tier-4": 3,
      "Lifetime Plan Tier-5": 3,
      "Lifetime Plan Standard": 3,
    };
    const currentTier = user.plan ? tierMap[user.plan.name] || 0 : 0;
    const newTier = tierMap[planRecord.name] || 0;
    if (currentTier > newTier) {
      return NextResponse.json(
        { error: "Cannot downgrade to a lower tier plan" },
        { status: 400 }
      );
    }

    const now = new Date();
    const planEnd = planRecord.durationDays
      ? new Date(now.getTime() + planRecord.durationDays * 86400e3)
      : null;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        planId: planRecord.id,
        planStart: now,
        planEnd,
      },
      include: { plan: true },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        plan: updatedUser.plan,
        planStart: updatedUser.planStart,
        planEnd: updatedUser.planEnd,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
