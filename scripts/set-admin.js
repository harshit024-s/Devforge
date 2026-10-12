require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");

async function main() {
  const targetEmail = (process.argv[2] || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const rawPassword = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!targetEmail || !rawPassword) {
    console.log("Usage: node scripts/set-admin.js <email> <password>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const demoted = await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: { role: "STUDENT" },
  });
  console.log(`Demoted ${demoted.count} prior ADMIN user(s) to STUDENT.`);

  const existing = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email: targetEmail },
      data: {
        role: "ADMIN",
        passwordHash,
      },
    });
    console.log(`Updated existing user: ${updated.email} to ADMIN.`);
  } else {
    const created = await prisma.user.create({
      data: {
        name: "DevForge Super Admin",
        email: targetEmail,
        passwordHash,
        role: "ADMIN",
        referralCode: "DFADMIN1",
        points: 5000,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
    });
    console.log(`Created new sole ADMIN user: ${created.email}`);
  }

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  console.log("Current Users in Database:");
  console.table(allUsers);
}

main()
  .catch((e) => {
    console.error("Error setting admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
