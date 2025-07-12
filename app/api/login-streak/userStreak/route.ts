//  added by aaisha


// app/api/streak/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authConfig } from "../../auth/[...nextauth]/auth.config";
import { ActivityType } from '@prisma/client';

const STREAK_MILESTONES = [7, 21, 45, 90];

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id;
  const isLogin = req.headers.get('activity-type') === 'login';

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();

  // Get or initialize user streak
  let streak = await prisma.userStreak.findUnique({ where: { userId } }) || await prisma.userStreak.create({
    data: {
      userId,
      currentStreak: 0,
      lastActiveDay: new Date(0),
      loginCount: 0
    }
  });

  const lastActive = new Date(streak.lastActiveDay);
  const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = 0;
  // let resetStreak = false;

  if (daysDiff === 0) {
    // Already logged in today, just update login count if applicable
    if (isLogin) {
      streak = await prisma.userStreak.update({
        where: { userId },
        data: { loginCount: streak.loginCount + 1 }
      });
    }
    return NextResponse.json({ streak });
  }

  if (daysDiff === 1) {
    // Continue streak
    newStreak = streak.currentStreak + 1;
  } else {
    // Missed a day, reset streak
    newStreak = 1;
    // resetStreak = true;
  }

  // Update user streak data
  streak = await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      lastActiveDay: now,
      loginCount: isLogin ? streak.loginCount + 1 : streak.loginCount
    }
  });

  // if (resetStreak) {
  //   await prisma.notification.create({
  //     data: {
  //       userId,
  //       type: 'INFO',
  //       title: 'Streak Reset',
  //       message: `Your streak was broken. You're back to day 1. Keep going!`
  //     }
  //   });
  // }

  // If 90-day streak is already completed, don't give more rewards
  if (streak.currentStreak > 90) {
    return NextResponse.json({ streak });
  }

  // Check if the current streak matches a milestone
  if (STREAK_MILESTONES.includes(newStreak)) {
    const activityKey = `STREAK_${newStreak}_DAYS`;

    const activity = await prisma.activity.findUnique({
      where: { activity: activityKey as ActivityType } // ✅ type-casting
    });

    if (activity) {
      // Ensure not already rewarded for this milestone
      const existingReward = await prisma.transaction.findFirst({
        where: {
          userId,
          activityId: activity.id
        }
      });

      if (!existingReward) {
        await prisma.transaction.create({
          data: {
            userId,
            activityId: activity.id,
            jpAmount: activity.jpAmount
          }
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            jpEarned: { increment: activity.jpAmount },
            jpBalance: { increment: activity.jpAmount }
          }
        });

        await prisma.notification.create({
          data: {
            userId,
            type: 'JP_EARNED',
            title: `🔥 ${newStreak}-Day Streak Achieved!`,
            message: `You earned ${activity.jpAmount} Joy Pearls for your ${newStreak}-day streak! Keep it up!`
          }
        });

        console.log(`✅ Awarded ${activity.jpAmount} JP for ${newStreak}-day streak.`);
      }
    }
  }

  return NextResponse.json({ streak });
}


export async function GET() {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const streak = await prisma.userStreak.findUnique({
    where: { userId }
  });

  return NextResponse.json({ streak });
}



// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { prisma } from '@/lib/prisma';
// import { authConfig } from "../../auth/[...nextauth]/auth.config";

// // Use shorter intervals for testing
// const MILESTONES = [
//   { minutes: 1, reward: 5 },
//   { minutes: 2, reward: 10 },
//   { minutes: 3, reward: 20 },
//   { minutes: 5, reward: 50 }
// ];

// export async function POST(req: Request) {
//   const session = await getServerSession(authConfig);
//   const userId = session?.user?.id;
//   const isLogin = req.headers.get('activity-type') === 'login';

//   if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const now = new Date();

//   // Get or initialize streak
//   let streak = await prisma.userStreak.findUnique({ where: { userId } }) || 
//     await prisma.userStreak.create({
//       data: { 
//         userId, 
//         currentStreak: 0,
//         lastActiveDay: new Date(0),
//         loginCount: 0
//       }
//     });

//   const lastActive = new Date(streak.lastActiveDay);
//   const minutesDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

//   // Already active within this same minute
//   if (minutesDiff < 1) {
//     if (isLogin) {
//       streak = await prisma.userStreak.update({
//         where: { userId },
//         data: { loginCount: streak.loginCount + 1 }
//       });
//     }
//     return NextResponse.json({ streak });
//   }

//   // Calculate new streak
//   const newStreak = minutesDiff === 1 ? streak.currentStreak + 1 : 1;

//   // Update streak
//   streak = await prisma.userStreak.update({
//     where: { userId },
//     data: {
//       currentStreak: newStreak,
//       lastActiveDay: now,
//       loginCount: isLogin ? streak.loginCount + 1 : streak.loginCount
//     }
//   });

//   // Check for milestone reward
//   const milestone = MILESTONES.find(m => m.minutes === newStreak);
//   if (milestone) {
//     await awardMilestoneReward(userId, milestone);
//   }

//   return NextResponse.json({ streak });
// }

// async function awardMilestoneReward(userId: string, milestone: { minutes: number, reward: number }) {
//   let activity = await prisma.activity.findUnique({
//     where: { activity: 'DAILY_LOGIN' }
//   });

//   if (!activity) {
//     activity = await prisma.activity.create({
//       data: {
//         activity: 'DAILY_LOGIN',
//         jpAmount: 0,
//         transactionType: 'CREDIT'
//       }
//     });
//   }

//   const now = new Date();
//   const recentWindow = new Date(now.getTime() - 60 * 1000); // Only one reward per minute for testing

//   const existingReward = await prisma.transaction.findFirst({
//     where: {
//       userId,
//       activityId: activity.id,
//       jpAmount: milestone.reward,
//       createdAt: { gte: recentWindow }
//     }
//   });

//   if (existingReward) return;

//   await prisma.transaction.create({
//     data: {
//       userId,
//       activityId: activity.id,
//       jpAmount: milestone.reward
//     }
//   });

//   await prisma.user.update({
//     where: { id: userId },
//     data: {
//       jpEarned: { increment: milestone.reward },
//       jpBalance: { increment: milestone.reward }
//     }
//   });

//   await prisma.notification.create({
//     data: {
//       userId,
//       type: 'JP_EARNED',
//       title: 'Streak Milestone Reached!',
//       message: `You earned ${milestone.reward} Joy Pearls for your ${milestone.minutes}-minute streak!`
//     }
//   });

//   console.log(`Awarded ${milestone.reward} JP for ${milestone.minutes}-minute streak.`);
// }

// export async function GET(req: Request) {
//   const session = await getServerSession(authConfig);
//   const userId = session?.user?.id;

//   if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const streak = await prisma.userStreak.findUnique({
//     where: { userId }
//   });

//   return NextResponse.json({ streak });
// }

