require("dotenv").config();
const prisma = require("../src/lib/prisma");

async function seedContests() {
  const count = await prisma.contest.count();
  if (count > 0) {
    console.log("Contests already exist:", count);
    return;
  }

  const now = new Date();
  const c1 = await prisma.contest.create({
    data: {
      title: "DevForge Biweekly Contest 1",
      slug: "devforge-biweekly-contest-1",
      description: "Test your algorithmic speed and accuracy in 90 minutes. 4 challenges spanning Arrays, Dynamic Programming, Graphs, and Trees. Top performers earn 500 bonus points and exclusive badges!",
      startTime: new Date(now.getTime() - 1000 * 60 * 30), 
      endTime: new Date(now.getTime() + 1000 * 60 * 60),    
      duration: 90,
      bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    },
  });

  const c2 = await prisma.contest.create({
    data: {
      title: "Weekly Sprint 12: Graph Theory & Shortest Path",
      slug: "weekly-sprint-12",
      description: "Fast-paced algorithmic challenge focusing on BFS, DFS, Dijkstra, and Topological Sort. Sharpen your competitive programming intuition.",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2), 
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 90),
      duration: 90,
      bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    },
  });

  const c3 = await prisma.contest.create({
    data: {
      title: "Global Algorithms Championship 2026",
      slug: "global-algorithms-championship-2026",
      description: "DevForge premiere open championship. Solve hard-level dynamic programming, segment trees, and bitmask state compression.",
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7), 
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 120),
      duration: 120,
      bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    },
  });

  const students = await prisma.user.findMany({ take: 3 });
  for (const s of students) {
    await prisma.contestRegistration.create({
      data: {
        contestId: c1.id,
        userId: s.id,
        score: s.points > 0 ? Math.min(s.points, 350) : 100,
      },
    });
  }

  console.log("Contests successfully seeded:", c1.title, c2.title, c3.title);
}

seedContests()
  .catch((e) => {
    console.error("Contest seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
