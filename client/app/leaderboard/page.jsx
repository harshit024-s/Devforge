"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Flame, Star, Sparkles, User, Code2, BookOpen } from "lucide-react";
import Navbar from "../../components/Navbar";
import { leaderboardAPI } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      setLoading(true);
      const res = await leaderboardAPI.getTop(1, 50);
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            <Trophy className="h-4 w-4" />
            Global DevForge Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Hall of <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Fame</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg mt-3 leading-relaxed">
            Solve DSA problems, ace biweekly contests, and conquer the coding leaderboard to earn elite developer accolades.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
                {/* 2nd Place */}
                {topThree[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="order-2 md:order-1 glass-panel rounded-3xl p-6 border border-zinc-800/80 text-center relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80"
                  >
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        #2 Silver
                      </span>
                    </div>
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-zinc-400 to-zinc-200 p-[3px] shadow-lg mb-4">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xl text-white">
                        {topThree[1].name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-white truncate">{topThree[1].name}</h3>
                    <div className="text-2xl font-black text-amber-400 mt-2">{topThree[1].points} <span className="text-xs text-zinc-500 font-medium">PTS</span></div>
                    <div className="flex justify-center gap-4 text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-800/60">
                      <span>{topThree[1].problemsSolved || 0} Solved</span>
                      <span>•</span>
                      <span>{topThree[1].enrolledCourses || 0} Courses</span>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place (Champion) */}
                {topThree[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="order-1 md:order-2 glass-panel rounded-3xl p-8 border border-amber-500/40 text-center relative overflow-hidden bg-gradient-to-b from-amber-950/20 via-zinc-900/80 to-zinc-950 md:-translate-y-4 shadow-2xl shadow-amber-950/20"
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
                      <CrownIcon className="h-4 w-4 text-amber-400" />
                      Grand Champion
                    </div>
                    <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 p-[3px] shadow-xl shadow-amber-500/30 mb-4">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-2xl text-amber-300">
                        {topThree[0].name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="font-extrabold text-xl text-white truncate">{topThree[0].name}</h3>
                    <div className="text-3xl font-black text-amber-400 mt-2">{topThree[0].points} <span className="text-sm text-zinc-400 font-medium">PTS</span></div>
                    <div className="flex justify-center gap-4 text-xs text-zinc-300 mt-5 pt-4 border-t border-amber-500/20">
                      <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5 text-amber-400" /> {topThree[0].problemsSolved || 0} Solved</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-amber-400" /> {topThree[0].enrolledCourses || 0} Courses</span>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="order-3 glass-panel rounded-3xl p-6 border border-zinc-800/80 text-center relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80"
                  >
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-900/30 text-amber-400 border border-amber-800/50">
                        #3 Bronze
                      </span>
                    </div>
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 p-[3px] shadow-lg mb-4">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xl text-white">
                        {topThree[2].name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-white truncate">{topThree[2].name}</h3>
                    <div className="text-2xl font-black text-amber-400 mt-2">{topThree[2].points} <span className="text-xs text-zinc-500 font-medium">PTS</span></div>
                    <div className="flex justify-center gap-4 text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-800/60">
                      <span>{topThree[2].problemsSolved || 0} Solved</span>
                      <span>•</span>
                      <span>{topThree[2].enrolledCourses || 0} Courses</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Complete Table Section */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl">
              <div className="p-6 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-950/40">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <Medal className="h-5 w-5 text-brand-400" />
                  Full Rankings Table
                </h2>
                <span className="text-xs text-zinc-500">{leaderboard.length} Developers Ranked</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Developer</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Problems Solved</th>
                      <th className="px-6 py-4 hidden md:table-cell">Enrolled Courses</th>
                      <th className="px-6 py-4 text-right">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {leaderboard.map((u) => {
                      const isMe = currentUser?.id === u.id;
                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors ${
                            isMe ? "bg-brand-500/10 hover:bg-brand-500/15" : "hover:bg-zinc-900/30"
                          }`}
                        >
                          <td className="px-6 py-4 font-bold">
                            <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs ${
                              u.rank === 1
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black"
                                : u.rank === 2
                                ? "bg-zinc-300/20 text-zinc-200 border border-zinc-300/30 font-black"
                                : u.rank === 3
                                ? "bg-amber-700/20 text-amber-500 border border-amber-700/30 font-black"
                                : "text-zinc-400"
                            }`}>
                              {u.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                {u.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-white flex items-center gap-1.5">
                                  {u.name}
                                  {isMe && (
                                    <span className="text-[10px] bg-brand-500 text-white font-bold px-1.5 py-0.2 rounded">
                                      YOU
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-zinc-500">{u.role}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-extrabold text-amber-400">
                            {u.points.toLocaleString()} pts
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell text-zinc-300">
                            {u.problemsSolved || 0}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell text-zinc-400">
                            {u.enrolledCourses || 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {u.points >= 2000 ? "Grandmaster" : u.points >= 1000 ? "Master" : u.points >= 300 ? "Specialist" : "Apprentice"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function CrownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}
