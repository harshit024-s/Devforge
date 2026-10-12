"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, DollarSign, Activity, Code2, Award, GraduationCap } from "lucide-react";
import { dashboardAPI } from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data.data.stats);
      setRecentUsers(data.data.recentUsers);
      setRecentEnrollments(data.data.recentEnrollments);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = stats
    ? [
        {
          name: "Total Revenue",
          value: `$${(stats.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: DollarSign,
          color: "text-green-400",
          bg: "bg-green-500/10",
        },
        {
          name: "Total Users",
          value: stats.totalUsers.toLocaleString(),
          icon: Users,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          name: "Published Courses",
          value: `${stats.publishedCourses} / ${stats.totalCourses}`,
          icon: BookOpen,
          color: "text-purple-400",
          bg: "bg-purple-500/10",
        },
        {
          name: "Total Enrollments",
          value: stats.totalEnrollments.toLocaleString(),
          icon: GraduationCap,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          name: "DSA Problems",
          value: stats.totalProblems.toLocaleString(),
          icon: Code2,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
        },
        {
          name: "Submissions",
          value: stats.totalSubmissions.toLocaleString(),
          icon: Award,
          color: "text-rose-400",
          bg: "bg-rose-500/10",
        },
        {
          name: "Active Enrollments",
          value: stats.activeEnrollments.toLocaleString(),
          icon: Activity,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          name: "Completed",
          value: stats.completedEnrollments.toLocaleString(),
          icon: Award,
          color: "text-indigo-400",
          bg: "bg-indigo-500/10",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-1">
          Live platform statistics. Updates every 10 seconds.
          <span className="ml-2 inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass-panel p-5 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className={`h-14 w-14 ${stat.color}`} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{stat.name}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="glass-panel p-6 rounded-2xl"
        >
          <h2 className="text-lg font-bold text-white mb-4">Recent Signups</h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No users yet. Users will appear here after registration.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    user.role === "ADMIN"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : user.role === "INSTRUCTOR"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass-panel p-6 rounded-2xl"
        >
          <h2 className="text-lg font-bold text-white mb-4">Recent Enrollments</h2>
          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No enrollments yet. They will appear here when users enroll in courses.</p>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-4 w-4 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{enrollment.user?.name}</p>
                    <p className="text-xs text-zinc-500 truncate">enrolled in {enrollment.course?.title}</p>
                  </div>
                  <span className="text-xs text-zinc-600">
                    ${enrollment.course?.price || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
