import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.activity.upsert({
    where: { activity: "BUDDY_LENS_REQUEST" },
    update: {},
    create: {
      activity: "BUDDY_LENS_REQUEST",
      jpAmount: 500, // Default, varies by tier
      transactionType: "DEBIT",
    },
  });
  await prisma.activity.upsert({
    where: { activity: "BUDDY_LENS_REVIEW" },
    update: {},
    create: {
      activity: "BUDDY_LENS_REVIEW",
      jpAmount: 500, // Default, varies
      transactionType: "CREDIT",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
