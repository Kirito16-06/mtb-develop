import {  Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const defaultPassword = await hash("password123", 10);

  const dummyUsers = [
    {
      email: "developer.deepak25@gmail.com",
      password: await hash('deepak2505', 10), // 'deepak2505',
      name: "Admin User",
      role: Role.ADMIN,
      jpEarned: 1000,
      jpSpent: 200,
    },
    {
      email: "john@example.com",
      password: defaultPassword,
      name: "John Doe",
      role: Role.USER,
      jpEarned: 750,
      jpSpent: 150,
    },
    {
      email: "jane@example.com",
      password: defaultPassword,
      name: "Jane Smith",
      role: Role.USER,
      jpEarned: 500,
      jpSpent: 100,
    },
    {
      email: "bob@example.com",
      password: defaultPassword,
      name: "Bob Wilson",
      role: Role.USER,
      jpEarned: 300,
      jpSpent: 50,
    },
    {
      email: "alice@example.com",
      password: defaultPassword,
      name: "Alice Brown",
      role: Role.USER,
      jpEarned: 450,
      jpSpent: 75,
    },
  ];

  for (const user of dummyUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { email: user.email },
      create: user,
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
