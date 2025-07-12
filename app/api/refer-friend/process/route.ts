

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";
import { assignJp } from "@/lib/utils/jp";

export async function POST(req: NextRequest) {
  try {
    const { referralCode, userId } = await req.json();
    console.log("referralCode=",referralCode, "userId=", userId);
    if (!referralCode || !userId) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const referrer = await prisma.user.findUnique({ where: { referralCode } });

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // ❗ Check if user is already referred
    if (user.referredById) {
      return NextResponse.json({ error: "User already referred" }, { status: 400 });
    }

    // ✅ Create Referral Record
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: user.id
      },
    });

    // ✅ Update referredById on user
   const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        referredById: referrer.id,
        // jpEarned: user.jpEarned + 500,
        // jpBalance: user.jpBalance + 500,
      },
      include: { plan: true },
    });

    // ✅ Assign JP to user
    assignJp(updatedUser, ActivityType.REFER_TO);


    // ✅ Optionally: Reward Referrer too
   const ReferrerUser = await prisma.user.findFirst({

      where: { id: referrer.id },

      // data: {
      //   jpEarned: referrer.jpEarned + 500,
      //   jpBalance: referrer.jpBalance + 500,
      // },
      include: { plan: true },
    });

    // ✅ Assign JP to referrer
    assignJp(ReferrerUser!, ActivityType.REFER_BY);

    return NextResponse.json({ message: "Referral successfully processed" });
  } catch (error) {
    console.error("Referral error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
