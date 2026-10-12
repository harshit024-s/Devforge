"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Code2, Filter } from "lucide-react";
import Navbar from "../../components/Navbar";
import { problemsAPI } from "../../lib/api";

const difficultyColors = {
  EASY: "text-green-400 bg-green-400/10 border-green-400/20",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  HARD: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function PracticePage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadProblems();
  }, [filter]);

  async function loadProblems() {
    try {
      setLoading(true);
      const data = await problemsAPI.getAll({ difficulty: filter || undefined });
      setProblems(data.data.problems);
    } catch (err) {
      console.error("Failed to load problems:", err);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Practice <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">DSA</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Solve coding challenges to sharpen your data structures and algorithms skills.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {["", "EASY", "MEDIUM", "HARD"].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === d
                  ? "bg-brand-500/10 text-brand-400 border-brand-500/20"
                  : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              {d || "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : problems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Code2 className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No Problems Yet</h3>
            <p className="text-zinc-500">DSA problems will appear here once they&apos;re added by an admin.</p>
          </motion.div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Tags</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, i) => (
                  <motion.tr
                    key={problem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-zinc-800/30 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/practice/${problem.slug}`}
                        className="text-sm font-medium text-zinc-200 hover:text-brand-400 transition-colors"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${difficultyColors[problem.difficulty]}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex gap-1.5 flex-wrap">
                        {problem.tags?.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-brand-400">{problem.points}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
