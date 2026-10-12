const express = require("express");
const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../lib/s3");
const prisma = require("../lib/prisma");

const router = express.Router();

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const URL_EXPIRY = 600;

router.post("/get-upload-url", async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({
        success: false,
        message: "fileName, fileType, and fileSize are required",
      });
    }

    const allAllowed = [...ALLOWED_TYPES, ...ALLOWED_IMAGE_TYPES];
    if (!allAllowed.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed: ${allAllowed.join(", ")}`,
      });
    }

    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }

    const ext = fileName.split(".").pop();
    const prefix = ALLOWED_IMAGE_TYPES.includes(fileType) ? "courses/thumbnails" : "courses/videos";
    const uniqueKey = `${prefix}/${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: uniqueKey,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRY,
    });

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        key: uniqueKey,
        expiresIn: URL_EXPIRY,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/get-upload-url] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate upload URL",
    });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, modules: true } },
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: { orderBy: { position: "asc" } },
          },
        },
      },
    });

    return res.json({ success: true, data: { courses } });
  } catch (error) {
    console.error("[GET /api/admin/courses] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: { orderBy: { position: "asc" } },
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
    console.error("[GET /api/admin/courses/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch course" });
  }
});

router.post("/courses", async (req, res) => {
  try {
    const { title, description, price, thumbnailUrl, instructorId, isPublished } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "title and description are required",
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + crypto.randomUUID().slice(0, 6);

    let finalInstructorId = instructorId;
    if (!finalInstructorId) {
      const admin = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "INSTRUCTOR"] } },
        select: { id: true },
      });
      if (!admin) {
        
        const bcrypt = require("bcrypt");
        const generateReferralCode = require("../utils/generateReferralCode");
        const systemAdmin = await prisma.user.create({
          data: {
            name: "System Admin",
            email: "admin@devforge.com",
            passwordHash: await bcrypt.hash("admin123", 12),
            role: "ADMIN",
            referralCode: await generateReferralCode(),
          },
        });
        finalInstructorId = systemAdmin.id;
      } else {
        finalInstructorId = admin.id;
      }
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price: price ? parseFloat(price) : 0,
        thumbnailUrl: thumbnailUrl || null,
        instructorId: finalInstructorId,
        isPublished: isPublished || false,
      },
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
    });

    return res.status(201).json({ success: true, data: { course } });
  } catch (error) {
    console.error("[POST /api/admin/courses] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create course" });
  }
});

router.put("/courses/:id", async (req, res) => {
  try {
    const { title, description, price, thumbnailUrl, isPublished } = req.body;

    const updateData = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + "-" + crypto.randomUUID().slice(0, 6);
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
    });

    return res.json({ success: true, data: { course } });
  } catch (error) {
    console.error("[PUT /api/admin/courses/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update course" });
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("[DELETE /api/admin/courses/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete course" });
  }
});

router.post("/courses/:courseId/modules", async (req, res) => {
  try {
    const { title } = req.body;
    const { courseId } = req.params;

    const maxPos = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const mod = await prisma.module.create({
      data: {
        title: title || "New Module",
        courseId,
        position: (maxPos?.position || 0) + 1,
      },
      include: { lessons: true },
    });

    return res.status(201).json({ success: true, data: { module: mod } });
  } catch (error) {
    console.error("[POST /api/admin/courses/:courseId/modules] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create module" });
  }
});

router.put("/modules/:id", async (req, res) => {
  try {
    const { title, position } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (position !== undefined) updateData.position = position;

    const mod = await prisma.module.update({
      where: { id: req.params.id },
      data: updateData,
      include: { lessons: true },
    });

    return res.json({ success: true, data: { module: mod } });
  } catch (error) {
    console.error("[PUT /api/admin/modules/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update module" });
  }
});

router.delete("/modules/:id", async (req, res) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Module deleted" });
  } catch (error) {
    console.error("[DELETE /api/admin/modules/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete module" });
  }
});

router.post("/modules/:moduleId/lessons", async (req, res) => {
  try {
    const { title, content, videoUrl, duration, isPreview } = req.body;
    const { moduleId } = req.params;

    const maxPos = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: title || "New Lesson",
        content: content || null,
        videoUrl: videoUrl || null,
        duration: duration ? parseInt(duration) : null,
        isPreview: isPreview || false,
        moduleId,
        position: (maxPos?.position || 0) + 1,
      },
    });

    return res.status(201).json({ success: true, data: { lesson } });
  } catch (error) {
    console.error("[POST /api/admin/modules/:moduleId/lessons] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create lesson" });
  }
});

router.put("/lessons/:id", async (req, res) => {
  try {
    const { title, content, videoUrl, duration, isPreview, position } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (isPreview !== undefined) updateData.isPreview = isPreview;
    if (position !== undefined) updateData.position = position;

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return res.json({ success: true, data: { lesson } });
  } catch (error) {
    console.error("[PUT /api/admin/lessons/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update lesson" });
  }
});

router.delete("/lessons/:id", async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Lesson deleted" });
  } catch (error) {
    console.error("[DELETE /api/admin/lessons/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete lesson" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (role) where.role = role.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          points: true,
          avatarUrl: true,
          referralCode: true,
          createdAt: true,
          _count: { select: { enrollments: true, courses: true, submissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/users] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("[PUT /api/admin/users/:id/role] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update user role" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("[DELETE /api/admin/users/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

router.get("/problems", async (req, res) => {
  try {
    const problems = await prisma.dsaProblem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    return res.json({ success: true, data: { problems } });
  } catch (error) {
    console.error("[GET /api/admin/problems] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch problems" });
  }
});

router.post("/problems", async (req, res) => {
  try {
    const { title, description, difficulty, tags, points } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "title and description are required" });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + crypto.randomUUID().slice(0, 6);

    const problem = await prisma.dsaProblem.create({
      data: {
        title,
        slug,
        description,
        difficulty: difficulty || "EASY",
        tags: tags || [],
        points: points ? parseInt(points) : 10,
      },
    });

    return res.status(201).json({ success: true, data: { problem } });
  } catch (error) {
    console.error("[POST /api/admin/problems] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create problem" });
  }
});

router.put("/problems/:id", async (req, res) => {
  try {
    const { title, description, difficulty, tags, points } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (tags !== undefined) updateData.tags = tags;
    if (points !== undefined) updateData.points = parseInt(points);

    const problem = await prisma.dsaProblem.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return res.json({ success: true, data: { problem } });
  } catch (error) {
    console.error("[PUT /api/admin/problems/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update problem" });
  }
});

router.delete("/problems/:id", async (req, res) => {
  try {
    await prisma.dsaProblem.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Problem deleted" });
  } catch (error) {
    console.error("[DELETE /api/admin/problems/:id] Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete problem" });
  }
});

module.exports = router;
