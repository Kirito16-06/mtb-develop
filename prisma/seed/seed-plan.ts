import { prisma } from "@/lib/prisma";

// * this seed script is meant for production as well
async function main() {
  const plans = [
    {
      name: "Monthly Plan",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: 30,
      price: "29",
    },
    {
      name: "Yearly Plan",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: 365,
      price: "299",
    },
    {
      name: "Lifetime Plan Standard",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: null,
      price: "2999",
    },
    {
      name: "Lifetime Plan Tier-1",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: 30,
      price: "499",
    },
    {
      name: "Lifetime Plan Tier-2",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: null,
      price: "699",
    },
    {
      name: "Lifetime Plan Tier-3",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: null,
      price: "999",
    },
    {
      name: "Lifetime Plan Tier-4",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: null,
      price: "1399",
    },
    {
      name: "Lifetime Plan Tier-5",
      jpMultiplier: 1.5,
      discountPercent: 20.0,
      durationDays: null,
      price: "1899",
    },
    
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        // name: plan.name,
        // price: plan.price,
      },
      create: plan,
    });
  }

  console.log("Seed data for plans inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
