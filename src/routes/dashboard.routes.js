const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalProblems,
      totalSubmissions,
      recentUsers,
      recentEnrollments,
      courseStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.dsaProblem.count(),
      prisma.submission.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      prisma.enrollment.findMany({
        orderBy: { enrolledAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true, price: true } },
        },
      }),
      prisma.course.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          isPublished: true,
          _count: { select: { enrollments: true, modules: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    let totalRevenue = 0;
    for (const course of courseStats) {
      totalRevenue += course.price * course._count.enrollments;
    }

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          totalProblems,
          totalSubmissions,
          totalRevenue,
        },
        recentUsers,
        recentEnrollments,
        courseStats,
      },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/stats] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

module.exports = router;
