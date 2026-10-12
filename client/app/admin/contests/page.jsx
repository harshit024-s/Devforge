"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Swords, Calendar, Clock, Users, X, Eye, EyeOff } from "lucide-react";
import { adminContestsAPI } from "../../../lib/api";

export default function AdminContestsPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    duration: 90,
    bannerUrl: "",
    isPublished: true,
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadContests();
  }, []);

  async function loadContests() {
    try {
      setLoading(true);
      const res = await adminContestsAPI.getAll();
      setContests(res.data.contests);
    } catch (err) {
      console.error("Failed to load contests:", err);
      setNotification({ type: "error", message: "Failed to load contests." });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingContest(null);
    const now = new Date();
    const startStr = new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16);
    const endStr = new Date(now.getTime() + 1000 * 60 * 60 * 24 + 1000 * 60 * 90).toISOString().slice(0, 16);
    setFormData({
      title: "",
      description: "",
      startTime: startStr,
      endTime: endStr,
      duration: 90,
      bannerUrl: "",
      isPublished: true,
    });
    setShowModal(true);
  }

  function handleOpenEdit(contest) {
    setEditingContest(contest);
    const startStr = new Date(contest.startTime).toISOString().slice(0, 16);
    const endStr = new Date(contest.endTime).toISOString().slice(0, 16);
    setFormData({
      title: contest.title,
      description: contest.description,
      startTime: startStr,
      endTime: endStr,
      duration: contest.duration || 90,
      bannerUrl: contest.bannerUrl || "",
      isPublished: contest.isPublished,
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingContest) {
        await adminContestsAPI.update(editingContest.id, formData);
        setNotification({ type: "success", message: "Contest updated successfully." });
      } else {
        await adminContestsAPI.create(formData);
        setNotification({ type: "success", message: "Contest created successfully." });
      }
      setShowModal(false);
      loadContests();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to save contest." });
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete contest "${title}"?`)) return;
    try {
      await adminContestsAPI.delete(id);
      setNotification({ type: "success", message: `Contest "${title}" deleted.` });
      loadContests();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to delete contest." });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Contests Management</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Create, schedule, and oversee competitive programming challenges and hackathons.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-900/30 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Contest
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

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contests.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Swords className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-300">No contests scheduled yet</h3>
          <p className="text-zinc-500 text-sm mt-1">Click &apos;Create Contest&apos; above to launch a new competition.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Contest</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 hidden sm:table-cell">Participants</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {contests.map((c) => {
                const startDate = new Date(c.startTime);
                const endDate = new Date(c.endTime);
                const now = new Date();
                let statusLabel = "UPCOMING";
                let badgeClass = "bg-brand-500/10 text-brand-400 border-brand-500/20";
                if (now >= startDate && now <= endDate) {
                  statusLabel = "LIVE";
                  badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                } else if (now > endDate) {
                  statusLabel = "ENDED";
                  badgeClass = "bg-zinc-800 text-zinc-400 border-zinc-700";
                }

                return (
                  <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{c.title}</div>
                      <div className="text-xs text-zinc-500 font-mono">{c.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-300">
                      {startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400 font-medium">
                      {c.duration} mins
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-xs text-zinc-300">
                      {c._count?.registrations || 0} registered
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 text-zinc-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
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
                  {editingContest ? "Edit Contest" : "Create New Contest"}
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
                    Contest Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Biweekly Algorithms Contest 2"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Banner Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.bannerUrl}
                      onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Description & Contest Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Contest rules, problem types, prize distribution..."
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
                    {editingContest ? "Save Changes" : "Create Contest"}
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
