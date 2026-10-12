const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// GET /api/contests — List all upcoming and ongoing contests
router.get("/", async (req, res) => {
  try {
    const contests = await prisma.contest.findMany({
      where: { isPublished: true },
      orderBy: { startTime: "asc" },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    const now = new Date();
    const categorized = contests.map((c) => {
      let status = "UPCOMING";
      if (now >= new Date(c.startTime) && now <= new Date(c.endTime)) {
        status = "LIVE";
      } else if (now > new Date(c.endTime)) {
        status = "ENDED";
      }
      return {
        ...c,
        status,
        participantsCount: c._count.registrations,
      };
    });

    return res.json({ success: true, data: { contests: categorized } });
  } catch (error) {
    console.error("[GET /api/contests] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch contests" });
  }
});

// GET /api/contests/:slug — Contest details with registration check
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId } = req.query;

    const contest = await prisma.contest.findUnique({
      where: { slug },
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          take: 10,
          orderBy: { score: "desc" },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, points: true } },
          },
        },
      },
    });

    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    let isRegistered = false;
    if (userId) {
      const reg = await prisma.contestRegistration.findUnique({
        where: {
          contestId_userId: {
            contestId: contest.id,
            userId,
          },
        },
      });
      isRegistered = !!reg;
    }

    return res.json({
      success: true,
      data: {
        contest,
        isRegistered,
      },
    });
  } catch (error) {
    console.error("[GET /api/contests/:slug] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch contest" });
  }
});

// POST /api/contests/:id/register — Register user for a contest
router.post("/:id/register", async (req, res) => {
  try {
    const { userId } = req.body;
    const contestId = req.params.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    const existing = await prisma.contestRegistration.findUnique({
      where: {
        contestId_userId: { contestId, userId },
      },
    });

    if (existing) {
      return res.json({ success: true, message: "Already registered", registration: existing });
    }

    const registration = await prisma.contestRegistration.create({
      data: { contestId, userId, score: 0 },
    });

    return res.status(201).json({ success: true, message: "Registration successful", registration });
  } catch (error) {
    console.error("[POST /api/contests/:id/register] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to register for contest" });
  }
});

module.exports = router;
