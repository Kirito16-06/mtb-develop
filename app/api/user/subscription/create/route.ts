import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";

export async function POST(req: NextRequest) {
  // 1. Authenticate user
  const session = await checkRole("USER", "Not authorized");
  console.log(session)

  // 2. Parse body
  const { subscriptionId } = await req.json();
  console.log(subscriptionId);
  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
  }

  // 3. (Optional) Verify with PayPal
  //    GET https://api-m.${env}/v1/billing/subscriptions/${subscriptionId}

  // 4. Persist on user
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      subscriptionId,
      subscriptionStatus: "ACTIVE",
      subscriptionStart: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
