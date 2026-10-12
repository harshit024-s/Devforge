const crypto = require("crypto");
const prisma = require("../lib/prisma");

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LENGTH = 6;
const MAX_RETRIES = 5;

async function generateReferralCode() {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const bytes = crypto.randomBytes(CODE_LENGTH);
    const code = Array.from(bytes)
      .map((b) => CHARSET[b % CHARSET.length])
      .join("");

    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!existing) return code;
  }

  throw new Error("Failed to generate a unique referral code after maximum retries");
}

module.exports = generateReferralCode;
