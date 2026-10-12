require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");

async function seed() {
  console.log("Seeding database...");

  await prisma.submission.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.dsaProblem.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Alex Vance (Admin)",
      email: "admin@devforge.com",
      passwordHash,
      role: "ADMIN",
      referralCode: "ADM001",
      points: 1500,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const instructor = await prisma.user.create({
    data: {
      name: "Dr. Sarah Connor",
      email: "instructor@devforge.com",
      passwordHash,
      role: "INSTRUCTOR",
      referralCode: "INS001",
      points: 980,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Marcus Cole",
      email: "student@devforge.com",
      passwordHash,
      role: "STUDENT",
      referralCode: "STU001",
      points: 340,
      referredById: admin.id,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("Users created:", admin.email, instructor.email, student.email);

  const course1 = await prisma.course.create({
    data: {
      title: "Full-Stack Next.js 14 & Node.js Masterclass",
      slug: "fullstack-nextjs-nodejs-masterclass",
      description: "Master modern full-stack web engineering. Architect robust APIs, build high-performance Next.js frontends, and deploy serverless apps.",
      thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      price: 49.99,
      isPublished: true,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: "Module 1: Foundations & Architecture",
            position: 1,
            lessons: {
              create: [
                {
                  title: "Introduction & Modern Web Landscape",
                  duration: 18,
                  position: 1,
                  isPreview: true,
                  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                  content: "Welcome to the course! In this lesson, we explore modern microservices, SSR vs CSR, and cloud deployment targets.",
                },
                {
                  title: "Setting Up Development Environment",
                  duration: 25,
                  position: 2,
                  isPreview: true,
                  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                  content: "Configuring Node.js, Next.js App Router, TypeScript, and Docker containerization.",
                },
                {
                  title: "RESTful API Design Principles",
                  duration: 32,
                  position: 3,
                  isPreview: false,
                  content: "Deep dive into idempotency, HTTP status codes, security best practices, and rate limiting.",
                },
              ],
            },
          },
          {
            title: "Module 2: State Management & Database ORM",
            position: 2,
            lessons: {
              create: [
                {
                  title: "Prisma ORM & PostgreSQL Mastery",
                  duration: 40,
                  position: 1,
                  isPreview: false,
                  content: "Schema modeling, migrations, connection pooling, and complex relation queries.",
                },
                {
                  title: "Authentication with JWT & Session Cookies",
                  duration: 35,
                  position: 2,
                  isPreview: false,
                  content: "Implementing cryptographically secure user authentication and role-based access control.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Data Structures & Algorithms in Python & C++",
      slug: "dsa-python-cpp-accelerator",
      description: "Ace FAANG and Tier-1 engineering interviews. Comprehensive coverage of trees, graphs, dynamic programming, and greedy algorithms.",
      thumbnailUrl: "https://images.unsplash.com/photo-1516116211227-bbc13c7a6e1d?w=800&auto=format&fit=crop&q=80",
      price: 0, 
      isPublished: true,
      instructorId: admin.id,
      modules: {
        create: [
          {
            title: "Module 1: Time & Space Complexity Analysis",
            position: 1,
            lessons: {
              create: [
                {
                  title: "Mastering Big-O, Big-Omega, and Big-Theta",
                  duration: 20,
                  position: 1,
                  isPreview: true,
                  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                  content: "Comprehensive mathematical intuition and code examples for analyzing algorithmic complexity.",
                },
                {
                  title: "Array and String Two-Pointer Patterns",
                  duration: 30,
                  position: 2,
                  isPreview: true,
                  content: "Sliding window, fast & slow pointers, and prefix sum techniques.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "Cloud Infrastructure & DevOps with AWS & Docker",
      slug: "cloud-devops-aws-docker",
      description: "Learn to containerize, orchestrate, and deploy high-availability distributed systems on Amazon Web Services.",
      thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      price: 79.99,
      isPublished: true,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: "Module 1: Containerization Fundamentals",
            position: 1,
            lessons: {
              create: [
                {
                  title: "Docker from Scratch",
                  duration: 28,
                  position: 1,
                  isPreview: true,
                  content: "Building multi-stage Dockerfiles and optimizing image layers.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Courses created successfully.");

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      status: "ACTIVE",
    },
  });

  const problems = [
    {
      title: "Two Sum",
      slug: "two-sum",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
      difficulty: "EASY",
      tags: ["Array", "Hash Table"],
      points: 10,
    },
    {
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and closed in the correct order.",
      difficulty: "EASY",
      tags: ["String", "Stack"],
      points: 10,
    },
    {
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      description: "Given a string `s`, find the length of the longest substring without repeating characters.\n\nExample:\nInput: `s = 'abcabcbb'`\nOutput: `3` (The answer is `'abc'`, with length 3).",
      difficulty: "MEDIUM",
      tags: ["Hash Table", "String", "Sliding Window"],
      points: 20,
    },
    {
      title: "LRU Cache",
      slug: "lru-cache",
      description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class with `get` and `put` operations running in O(1) average time complexity.",
      difficulty: "MEDIUM",
      tags: ["Hash Table", "Linked List", "Design"],
      points: 25,
    },
    {
      title: "Trapping Rain Water",
      slug: "trapping-rain-water",
      description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      difficulty: "HARD",
      tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
      points: 50,
    },
    {
      title: "Merge k Sorted Lists",
      slug: "merge-k-sorted-lists",
      description: "You are given an array of `k` linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
      difficulty: "HARD",
      tags: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)"],
      points: 50,
    },
  ];

  for (const p of problems) {
    await prisma.dsaProblem.create({ data: p });
  }

  console.log(`Created ${problems.length} DSA problems.`);

  const twoSum = await prisma.dsaProblem.findUnique({ where: { slug: "two-sum" } });
  if (twoSum) {
    await prisma.submission.create({
      data: {
        code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`,
        language: "javascript",
        status: "ACCEPTED",
        runtime: 65,
        memory: 42100,
        userId: student.id,
        problemId: twoSum.id,
      },
    });
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
