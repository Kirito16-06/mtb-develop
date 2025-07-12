import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/auth.config';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import axios from 'axios';



// Function to send referral email
async function sendReferralEmail( userName: string, referralCode: string, recipientEmail: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.CONTACT_SENDER_EMAIL;
  if (!senderEmail || !brevoApiKey) {
    throw new Error("Missing necessary environment variables");
  }

  const brevoApiUrl = "https://api.brevo.com/v3/smtp/email";
  const headers = {
    "Content-Type": "application/json",
    "api-key": brevoApiKey,
  };

  const referralUrl = `${process.env.NEXT_URL}/signup?ref=${referralCode}`;

  const referralEmailPayload = {
    sender: { email: senderEmail },
    to: [{ email: recipientEmail }],
    subject: `${userName} invited you to join!`,
    htmlContent: `
      <h1>You've been invited!</h1>
      <p>${userName} has invited you to join our platform.</p>
      <p>Use their referral code: <strong>${referralCode}</strong></p>
      <p>Or click this link to sign up: <a href="${referralUrl}">${referralUrl}</a></p>
      <p>When you sign up, you'll receive 300 JP, and ${userName} will receive 500 JP!</p>
    `,
  };

  try {
    const res = await axios.post(brevoApiUrl, referralEmailPayload, { headers });
    console.log("Referral email sent successfully:", res.data);
  } catch (error) {
    console.error("Error sending referral email:", error);
    throw new Error('Failed to send referral email');
  }
}

// GET: Fetch referral stats
export async function GET() {
  try {
    console.log('fetching referral stats itz working');
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        referredBy: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        // Add transaction history for referral rewards
        transaction: {
          where: {
            activity: {
              activity: 'REFER_BY'
            }
          },
          select: {
            jpAmount: true,
            createdAt: true
          }
        }
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.referralCode) {
      const referralCode = nanoid(8);
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode },
      });
      user.referralCode = referralCode;
    }

    // Get current referral reward amount
    const referByActivity = await prisma.activity.findUnique({
      where: {
        activity: 'REFER_BY',
      },
      select: {
        jpAmount: true,
      },
    });

    if (!referByActivity) {
      return new NextResponse('Referral activity not found', { status: 404 });
    }

    const currentRewardAmount = referByActivity.jpAmount;
    const totalReferrals = user.referrals?.length || 0;
    
    // Calculate total rewards from actual transactions
    const totalRewards = user.transaction.reduce((sum, transaction) => sum + (transaction.jpAmount || 0), 0);

    return NextResponse.json({
      referralCode: user.referralCode,
      totalReferrals,
      totalRewards,
      currentRewardAmount,
      referrals: user.referrals.map((referral) => ({
        id: referral.id,
        name: referral.name,
        email: referral.email,
        joinedAt: referral.createdAt,
        rewardEarned: currentRewardAmount,
      })),
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: Send referral email
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, name: true, email: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.referralCode) {
      const referralCode = nanoid(8);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode },
      });
      user.referralCode = referralCode;
    }

    // Send the referral email
    await sendReferralEmail( user.name, user.referralCode, email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending referral email:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
