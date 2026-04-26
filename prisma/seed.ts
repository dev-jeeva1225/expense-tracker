import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  { name: "Arjun Mehta", email: "arjun@example.com" },
  { name: "Priya Sharma", email: "priya@example.com" },
  { name: "Rahul Kumar", email: "rahul@example.com" },
  { name: "Sneha Patel", email: "sneha@example.com" },
  { name: "Vikram Nair", email: "vikram@example.com" },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
  }

  console.log("Seeded 5 users. Default password: password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
