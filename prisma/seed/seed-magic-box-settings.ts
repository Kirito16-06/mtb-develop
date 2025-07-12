import { prisma } from "@/lib/prisma";

async function main() {
  const existing = await prisma.magicBoxSettings.findFirst();
  if (!existing) {
    await prisma.magicBoxSettings.create({
      data: {
        minJpAmount: 100,
        maxJpAmount: 500,
      },
    });
    console.log("Magic box settings seeded.");
  } else {
    console.log("Magic box settings already exist. Skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
