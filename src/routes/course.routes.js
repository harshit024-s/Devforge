const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = { isPublished: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnailUrl: true,
          price: true,
          createdAt: true,
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { enrollments: true, modules: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.course.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/courses] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                content: true,
                videoUrl: true,
                duration: true,
                position: true,
                isPreview: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.json({ success: true, data: { course } });
  } catch (error) {
    console.error("[GET /api/courses/:slug] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch course" });
  }
});

// Check enrollment status
router.get("/:id/enrollment-status", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.json({ success: true, enrolled: false });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: req.params.id,
        },
      },
    });

    return res.json({ success: true, enrolled: !!enrollment, enrollment });
  } catch (error) {
    console.error("[GET /api/courses/:id/enrollment-status] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to check enrollment" });
  }
});

// Enroll in course
router.post("/:id/enroll", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      return res.json({ success: true, message: "Already enrolled", enrollment: existing });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id,
        status: "ACTIVE",
      },
    });

    return res.status(201).json({ success: true, message: "Enrolled successfully", enrollment });
  } catch (error) {
    console.error("[POST /api/courses/:id/enroll] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to enroll in course" });
  }
});

module.exports = router;

