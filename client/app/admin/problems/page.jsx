"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Code2, Sparkles, X, Check, Tag } from "lucide-react";
import { adminProblemsAPI } from "../../../lib/api";

const DIFFICULTY_COLORS = {
  EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  HARD: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    tags: "",
    points: 10,
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadProblems();
  }, []);

  async function loadProblems() {
    try {
      setLoading(true);
      const res = await adminProblemsAPI.getAll();
      setProblems(res.data.problems);
    } catch (err) {
      console.error("Failed to load problems:", err);
      setNotification({ type: "error", message: "Failed to load problems." });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingProblem(null);
    setFormData({
      title: "",
      description: "",
      difficulty: "EASY",
      tags: "",
      points: 10,
    });
    setShowModal(true);
  }

  function handleOpenEdit(prob) {
    setEditingProblem(prob);
    setFormData({
      title: prob.title,
      description: prob.description,
      difficulty: prob.difficulty,
      tags: prob.tags ? prob.tags.join(", ") : "",
      points: prob.points || 10,
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        points: parseInt(formData.points) || 10,
      };

      if (editingProblem) {
        await adminProblemsAPI.update(editingProblem.id, payload);
        setNotification({ type: "success", message: "Problem updated successfully." });
      } else {
        await adminProblemsAPI.create(payload);
        setNotification({ type: "success", message: "Problem created successfully." });
      }

      setShowModal(false);
      loadProblems();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to save problem." });
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete problem "${title}"?`)) return;
    try {
      await adminProblemsAPI.delete(id);
      setNotification({ type: "success", message: `Problem "${title}" deleted.` });
      loadProblems();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to delete problem." });
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">DSA Problems</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Create, configure, and manage algorithmic coding challenges for students.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-900/30 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Problem
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          notification.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Problems List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : problems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Code2 className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-300">No problems created yet</h3>
          <p className="text-zinc-500 text-sm mt-1">Click &apos;Create Problem&apos; above to publish your first coding challenge.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4 hidden sm:table-cell">Tags</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4 hidden md:table-cell">Submissions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {problems.map((prob) => (
                <tr key={prob.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{prob.title}</div>
                    <div className="text-xs text-zinc-500 font-mono">{prob.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      DIFFICULTY_COLORS[prob.difficulty] || ""
                    }`}>
                      {prob.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex gap-1.5 flex-wrap">
                      {prob.tags?.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-amber-400 font-semibold">
                    {prob.points} pts
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-zinc-400 text-xs">
                    {prob._count?.submissions || 0} attempts
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(prob)}
                      className="p-2 text-zinc-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prob.id, prob.title)}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-zinc-700/60 bg-zinc-950 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingProblem ? "Edit DSA Problem" : "Create New DSA Problem"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Problem Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Invert Binary Tree"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Points Reward
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. Tree, DFS, Binary Tree"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Problem Description & Examples
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe problem statement, input constraints, and test examples..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md"
                  >
                    {editingProblem ? "Save Changes" : "Create Problem"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
