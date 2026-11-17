"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Users,
  Trophy,
  Shield,
  Sparkles,
  Crown,
  ChevronRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { dashboardAPI, leaderboardAPI } from "../lib/api";

const features = [
  {
    icon: Code2,
    tag: "Hands-on DSA",
    title: "DSA Practice Arena",
    description: "Sharpen algorithmic problem solving with curated challenges and automated test cases.",
    link: "/practice",
    action: "Solve Challenges",
    color: "from-purple-500 to-pink-500",
    glow: "rgba(168, 85, 247, 0.25)",
    gradientBorder: "group-hover:border-purple-500/50",
  },
  {
    icon: BookOpen,
    tag: "Curriculum",
    title: "Expert-Led Courses",
    description: "Learn from industry specialists with structured modules, real projects, and code milestones.",
    link: "/courses",
    action: "Browse Library",
    color: "from-blue-500 to-cyan-500",
    glow: "rgba(59, 130, 246, 0.25)",
    gradientBorder: "group-hover:border-blue-500/50",
  },

  {
    icon: Trophy,
    tag: "Competitive",
    title: "Rankings & Contests",
    description: "Compete in live biweekly coding contests, earn reputation points, and climb the leaderboard.",
    link: "/contests",
    action: "View Contests",
    color: "from-amber-500 to-orange-500",
    glow: "rgba(245, 158, 11, 0.25)",
    gradientBorder: "group-hover:border-amber-500/50",
  },
  {
    icon: Users,
    tag: "Community",
    title: "Global Developer Arena",
    description: "Connect with aspiring engineers, compare solutions, and learn optimal code patterns.",
    link: "/leaderboard",
    action: "View Rankings",
    color: "from-rose-500 to-red-500",
    glow: "rgba(244, 63, 94, 0.25)",
    gradientBorder: "group-hover:border-rose-500/50",
  },
  {
    icon: Shield,
    tag: "Verification",
    title: "Skill Verification & Admin",
    description: "Track progress across all topics, earn verified certificates, and showcase credentials.",
    link: "/courses",
    action: "Track Growth",
    color: "from-indigo-500 to-violet-500",
    glow: "rgba(99, 102, 241, 0.25)",
    gradientBorder: "group-hover:border-indigo-500/50",
  },
];

// Interactive Tilt Card Component
function TiltCard({ feature, index }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = -((y - centerY) / centerY) * 12;
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="perspective-1000"
    >
      <Link href={feature.link} className="block h-full group">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.15s ease-out",
          }}
          className={`relative h-full p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] ${feature.gradientBorder} transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden`}
        >
          {/* Cursor Spotlight Glare */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, ${feature.glow}, transparent 80%)`,
            }}
          />

          {/* Floating background ambient glow */}
          <div 
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-40 group-hover:scale-125"
            style={{ background: feature.glow }}
          />

          <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
            {/* Top row: Icon + Tag */}
            <div className="flex items-center justify-between mb-6">
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300`}
                style={{ transform: "translateZ(20px)" }}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 tracking-wide uppercase">
                {feature.tag}
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-extrabold text-white mb-2.5 group-hover:text-brand-300 transition-colors">
              {feature.title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              {feature.description}
            </p>

            {/* Action link */}
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-400 group-hover:text-brand-300 transition-colors pt-2 border-t border-white/[0.05]">
              <span>{feature.action}</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({
    courses: null,
    problems: null,
    activeUsers: null,
    languages: 4,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Fetch live stats and leaderboard data on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const statsRes = await dashboardAPI.getStats();
        if (isMounted && statsRes?.success && statsRes?.data?.stats) {
          const s = statsRes.data.stats;
          setStats({
            courses: s.publishedCourses ?? s.totalCourses ?? 0,
            problems: s.totalProblems ?? 0,
            activeUsers: s.totalUsers ?? 0,
            languages: 4,
          });
        }
      } catch (err) {
        console.error("Failed to load live stats:", err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }

      try {
        const lbRes = await leaderboardAPI.getTop(1, 5);
        if (isMounted && lbRes?.success && lbRes?.data?.leaderboard) {
          setLeaderboard(lbRes.data.leaderboard);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        if (isMounted) setLeaderboardLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Futuristic Background Blur Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/20 rounded-full mix-blend-screen filter blur-[140px] animate-blob pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full mix-blend-screen filter blur-[140px] animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[140px] animate-blob animation-delay-4000 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span className="text-sm font-semibold text-brand-300">DSA Practice & Learning Platform</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-[0.95]">
              Master Code.
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Build the Future.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Structured courses, hands-on DSA practice, and coding contests —
              everything you need to become a skilled developer.
            </p>

            {/* Action Buttons: "Get Started Free" now linked directly to /practice for DSA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/practice"
                className="group relative flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-500 transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(70,100,255,0.4)] hover:shadow-[0_0_50px_rgba(70,100,255,0.6)]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>

              <Link
                href="/courses"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900/80 backdrop-blur-md text-zinc-300 font-semibold text-lg hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800"
              >
                <BookOpen className="h-5 w-5 text-zinc-400" />
                <span>Browse Courses</span>
              </Link>
            </div>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Courses Stat */}
              <div className="relative p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center group hover:border-brand-500/40 transition-colors">
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-8 rounded-lg bg-zinc-800 animate-pulse" />
                  ) : (
                    <span>{stats.courses ?? 0}</span>
                  )}
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mt-1.5">
                  Available Courses
                </div>
              </div>

              {/* DSA Problems: Dynamic count based on DB */}
              <div className="relative p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center group hover:border-purple-500/40 transition-colors">
                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-8 rounded-lg bg-zinc-800 animate-pulse" />
                  ) : (
                    <span>{stats.problems ?? 0}</span>
                  )}
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mt-1.5 flex items-center justify-center gap-1">
                  <span>DSA Problems</span>
                </div>
              </div>

              {/* Active Users */}
              <div className="relative p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-emerald-500/20 text-center group hover:border-emerald-500/50 transition-colors bg-gradient-to-b from-emerald-500/[0.03] to-transparent">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-8 rounded-lg bg-zinc-800 animate-pulse" />
                  ) : (
                    <span>{stats.activeUsers ?? 0}</span>
                  )}
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mt-1.5">
                  Active Users
                </div>
              </div>

              {/* Total Contests */}
              <div className="relative p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center group hover:border-cyan-500/40 transition-colors">
                <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 tracking-tight">
                  Bi-Weekly
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mt-1.5">
                  Coding Contests
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Categories Section */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Learning Ecosystem
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              Everything You Need to
              <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Level Up</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              A comprehensive platform with everything you need to grow as a developer.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <TiltCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Showcase Section */}
      <section className="relative py-24 border-t border-zinc-900 bg-[#070709] overflow-hidden">
        {/* Ambient glow behind leaderboard */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/[0.07] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Trophy className="h-4 w-4" />
              Coding Hall of Fame
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Global <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Leaderboard</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              Real-time rankings based on DSA problem submissions, contest performance, and accumulated developer points.
            </p>
          </motion.div>

          {/* Leaderboard Cards Grid */}
          {leaderboardLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-9 w-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/10 max-w-xl mx-auto">
              <Trophy className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Be The First on the Leaderboard!</h3>
              <p className="text-sm text-zinc-400 mt-1 mb-6">
                Solve DSA problems in the practice arena to climb up the ranks.
              </p>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-colors"
              >
                Start Practicing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top 3 Podium Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
                {/* #2 Rank Silver */}
                {leaderboard[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="order-2 md:order-1 p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/60 text-center relative overflow-hidden group hover:border-zinc-500 transition-all shadow-xl"
                  >
                    <div className="absolute top-3.5 right-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        🥈 Rank #2
                      </span>
                    </div>
                    <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-tr from-zinc-400 to-zinc-200 p-[2.5px] shadow-lg mb-3">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-lg text-white">
                        {leaderboard[1].name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-base truncate">{leaderboard[1].name}</h3>
                    <p className="text-xs text-zinc-500 capitalize">{leaderboard[1].role?.toLowerCase()}</p>
                    <div className="text-2xl font-black text-amber-400 mt-2">
                      {leaderboard[1].points} <span className="text-xs font-semibold text-zinc-500">PTS</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800">
                      <span>{leaderboard[1].problemsSolved || 0} Solved</span>
                      <span>•</span>
                      <span>{leaderboard[1].enrolledCourses || 0} Courses</span>
                    </div>
                  </motion.div>
                )}

                {/* #1 Rank Gold Champion */}
                {leaderboard[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-amber-950/30 via-zinc-900/90 to-zinc-950 border-2 border-amber-500/50 text-center relative overflow-hidden md:-translate-y-4 shadow-2xl shadow-amber-500/10 group hover:border-amber-400 transition-all"
                  >
                    <div className="absolute top-3.5 right-3.5">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Crown className="h-3.5 w-3.5 text-amber-400" />
                        🥇 Champion
                      </span>
                    </div>
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-[3px] shadow-xl shadow-amber-500/25 mb-3">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-extrabold text-2xl text-amber-300">
                        {leaderboard[0].name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="font-extrabold text-white text-lg truncate">{leaderboard[0].name}</h3>
                    <p className="text-xs text-amber-400/80 capitalize font-medium">{leaderboard[0].role?.toLowerCase()}</p>
                    <div className="text-3xl font-black text-amber-400 mt-2">
                      {leaderboard[0].points} <span className="text-sm font-semibold text-zinc-400">PTS</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-zinc-300 mt-4 pt-3 border-t border-amber-500/20">
                      <span className="font-semibold">{leaderboard[0].problemsSolved || 0} Solved</span>
                      <span>•</span>
                      <span className="font-semibold">{leaderboard[0].enrolledCourses || 0} Courses</span>
                    </div>
                  </motion.div>
                )}

                {/* #3 Rank Bronze */}
                {leaderboard[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="order-3 p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/60 text-center relative overflow-hidden group hover:border-amber-700/60 transition-all shadow-xl"
                  >
                    <div className="absolute top-3.5 right-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                        🥉 Rank #3
                      </span>
                    </div>
                    <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 p-[2.5px] shadow-lg mb-3">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-lg text-white">
                        {leaderboard[2].name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-base truncate">{leaderboard[2].name}</h3>
                    <p className="text-xs text-zinc-500 capitalize">{leaderboard[2].role?.toLowerCase()}</p>
                    <div className="text-2xl font-black text-amber-400 mt-2">
                      {leaderboard[2].points} <span className="text-xs font-semibold text-zinc-500">PTS</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800">
                      <span>{leaderboard[2].problemsSolved || 0} Solved</span>
                      <span>•</span>
                      <span>{leaderboard[2].enrolledCourses || 0} Courses</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* View Full Leaderboard Link */}
              <div className="text-center pt-6">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-sm border border-white/10 hover:border-amber-500/40 transition-all group shadow-lg"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>View Full Global Leaderboard</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
