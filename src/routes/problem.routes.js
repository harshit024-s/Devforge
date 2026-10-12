const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const problem = await prisma.dsaProblem.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        tags: true,
        points: true,
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { problem },
    });
  } catch (error) {
    console.error("[GET /api/problems/:slug] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { difficulty, tag, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (difficulty) where.difficulty = difficulty.toUpperCase();
    if (tag) where.tags = { has: tag };

    const [problems, total] = await Promise.all([
      prisma.dsaProblem.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          tags: true,
          points: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.dsaProblem.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        problems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/problems] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
    });
  }
});

router.post("/:slug/submit", async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId, code, language, status = "ACCEPTED", runtime = 45, memory = 38500 } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, message: "Code and language are required" });
    }

    const problem = await prisma.dsaProblem.findUnique({
      where: { slug },
      select: { id: true, points: true },
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    let pointsEarned = 0;
    let userRecord = null;

    if (userId) {
      userRecord = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (userRecord && status === "ACCEPTED") {
      // Check if user already solved it
      const prevAccepted = await prisma.submission.findFirst({
        where: { userId: userRecord.id, problemId: problem.id, status: "ACCEPTED" },
      });

      if (!prevAccepted) {
        pointsEarned = problem.points;
        await prisma.user.update({
          where: { id: userRecord.id },
          data: { points: { increment: pointsEarned } },
        });
      }
    }

    let submission = null;
    if (userRecord) {
      submission = await prisma.submission.create({
        data: {
          code,
          language,
          status,
          runtime: Number(runtime),
          memory: Number(memory),
          userId: userRecord.id,
          problemId: problem.id,
        },
      });
    }

    return res.json({
      success: true,
      message: status === "ACCEPTED" ? "All test cases passed!" : "Submission failed",
      data: {
        submission,
        pointsEarned,
      },
    });
  } catch (error) {
    console.error("[POST /api/problems/:slug/submit] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to record submission" });
  }
});

module.exports = router;

