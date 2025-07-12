import { ActivityType, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";


// * this seed script is meant for production as well
async function main() {
  const activities = [
    {
      activity: ActivityType.SIGNUP,
      jpAmount: 500,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.DAILY_LOGIN,
      jpAmount: 50,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.QUIZ_CORRECT,
      jpAmount: 10,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.ADD_LOG,
      jpAmount: 20,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.SPOTLIGHT,
      jpAmount: 5000,
      transactionType: TransactionType.DEBIT,
    },
    {
      activity: ActivityType.PROSPERITY_DROP,
      jpAmount: 5000,
      transactionType: TransactionType.DEBIT,
    },
    {
      activity: ActivityType.BUSINESSPROFILE_COMPLETE,
      jpAmount: 100,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.MIRACLE_LOG,
      jpAmount: 50,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.PROGRESS_VAULT,
      jpAmount: 50,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.REFER_BY,
      jpAmount: 500,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.REFER_TO,
      jpAmount: 500,
      transactionType: TransactionType.CREDIT,
    },
    {
      // ! there will be two activity type one fror sender and one for receiver
      activity: ActivityType.MAGIC_BOX_SHARED_REWARD,
      jpAmount: 0, // will be handles by trnasection only  //! since here jp is not considered then many be turn it to non-required field
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.MAGIC_BOX_REWARD,
      jpAmount: 0, // JP is dynamic, handled in code
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.GENERAL_FEEDBACK,
      jpAmount: 50,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.FEATURE_REQUEST,
      jpAmount: 100,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.BUG_REPORT,
      jpAmount: 150,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.BUDDY_LENS_REQUEST,
      jpAmount: 0,
      transactionType: TransactionType.DEBIT,
    },
    {
      activity: ActivityType.BUDDY_LENS_REVIEW,
      jpAmount: 0,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.ALIGNED_ACTION,
      jpAmount: 50,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.STREAK_7_DAYS,
      jpAmount: 100,           // reward for 7-day streak
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.STREAK_21_DAYS,
      jpAmount: 300,           // reward for 21-day streak
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.STREAK_45_DAYS,
      jpAmount: 700,           // reward for 45-day streak
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.STREAK_90_DAYS,
      jpAmount: 1500,          // reward for 90-day streak
      transactionType: TransactionType.CREDIT,
    }, {
      activity: ActivityType.MIRACLE_STREAK_REWARD_7_DAYS,
      jpAmount: 750,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.MIRACLE_STREAK_REWARD_21_DAYS,
      jpAmount: 1500,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.MIRACLE_STREAK_REWARD_45_DAYS,
      jpAmount: 2500,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.MIRACLE_STREAK_REWARD_90_DAYS,
      jpAmount: 4000,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.PROGRESS_VAULT_STREAK_REWARD_7_DAYS,
      jpAmount: 750,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.PROGRESS_VAULT_STREAK_REWARD_21_DAYS,
      jpAmount: 1500,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.PROGRESS_VAULT_STREAK_REWARD_45_DAYS,
      jpAmount: 2500,
      transactionType: TransactionType.CREDIT,
    },
    {
      activity: ActivityType.PROGRESS_VAULT_STREAK_REWARD_90_DAYS,
      jpAmount: 4000,
      transactionType: TransactionType.CREDIT,
    },
   
    {
      activity: ActivityType.DAILY_BLOOM_CREATION_REWARD,
      jpAmount: 10,
      transactionType: TransactionType.CREDIT
    },
    {
      activity: ActivityType.DAILY_BLOOM_COMPLETION_REWARD,
      jpAmount: 20,
      transactionType: TransactionType.CREDIT
    }
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { activity: activity.activity },
      update: {
        // jpAmount: activity.jpAmount,
        // transactionType: activity.transactionType,
      },
      create: activity,
    });
  }

  console.log("Seed data for activities inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
