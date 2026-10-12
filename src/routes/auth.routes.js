const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const generateReferralCode = require("../utils/generateReferralCode");
const { registerSchema } = require("../validators/auth.validator");

const router = express.Router();

const BCRYPT_SALT_ROUNDS = 12;

router.post("/register", async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const { name, email, password, inviteCode } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    let referredById = null;

    if (inviteCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: inviteCode },
        select: { id: true },
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid invite code",
        });
      }

      referredById = referrer.id;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const referralCode = await generateReferralCode();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        referralCode,
        referredById,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user },
    });
  } catch (error) {
    console.error("[POST /api/auth/register] Error:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        points: true,
        referralCode: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Remove passwordHash from response
    const { passwordHash: _, ...userData } = user;

    return res.json({
      success: true,
      message: "Login successful",
      data: { user: userData },
    });
  } catch (error) {
    console.error("[POST /api/auth/login] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/auth/me — get current user by ID (simple session-less approach)
router.get("/me/:userId", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        points: true,
        referralCode: true,
        createdAt: true,
        _count: { select: { enrollments: true, courses: true, submissions: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("[GET /api/auth/me/:userId] Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
