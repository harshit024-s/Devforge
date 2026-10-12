const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// GET /api/leaderboard — Top ranked users by points
router.get("/", async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          points: true,
          createdAt: true,
          _count: {
            select: {
              submissions: { where: { status: "ACCEPTED" } },
              enrollments: true,
            },
          },
        },
        orderBy: [{ points: "desc" }, { createdAt: "asc" }],
        skip,
        take: Number(limit),
      }),
      prisma.user.count(),
    ]);

    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      problemsSolved: user._count.submissions,
      enrolledCourses: user._count.enrollments,
    }));

    return res.json({
      success: true,
      data: {
        leaderboard: rankedUsers,
        total,
        page: Number(page),
      },
    });
  } catch (error) {
    console.error("[GET /api/leaderboard] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
