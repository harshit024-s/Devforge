"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Search, Plus, Award, UserPlus, Flame, Star, 
  ArrowUpDown, ExternalLink, RefreshCw, X, Check, Edit3, Shield
} from "lucide-react";
import Link from "next/link";
import { adminUsersAPI } from "../../../lib/api";

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [editingUserPoints, setEditingUserPoints] = useState(null);
  const [customPoints, setCustomPoints] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    points: 100,
  });

  useEffect(() => {
    loadLeaderboard();
  }, [page]);

  async function loadLeaderboard() {
    try {
      setLoading(true);
      const res = await adminUsersAPI.getLeaderboard({
        page,
        limit: 50,
        search: search || undefined,
      });
      setLeaderboard(res.data.leaderboard || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalUsers(res.data.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to load admin leaderboard:", err);
      setNotification({ type: "error", message: err.message || "Failed to load leaderboard." });
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadLeaderboard();
  };

  async function handleQuickDelta(userId, userName, delta) {
    try {
      await adminUsersAPI.addPointsDelta(userId, delta);
      setNotification({
        type: "success",
        message: `${delta > 0 ? "+" + delta : delta} points awarded to ${userName}!`,
      });
      loadLeaderboard();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to update points." });
    }
  }

  async function handleSaveCustomPoints(e) {
    e.preventDefault();
    if (!editingUserPoints) return;
    try {
      const pts = parseInt(customPoints);
      if (isNaN(pts) || pts < 0) {
        throw new Error("Please enter a valid non-negative number of points.");
      }
      await adminUsersAPI.updatePoints(editingUserPoints.id, pts);
      setNotification({
        type: "success",
        message: `Points updated to ${pts} for ${editingUserPoints.name}.`,
      });
      setEditingUserPoints(null);
      setCustomPoints("");
      loadLeaderboard();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to set points." });
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    try {
      await adminUsersAPI.create(newUserForm);
      setNotification({
        type: "success",
        message: `User ${newUserForm.name} created and added to Leaderboard with ${newUserForm.points} points!`,
      });
      setShowAddUserModal(false);
      setNewUserForm({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        points: 100,
      });
      loadLeaderboard();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to create user." });
    }
  }

  const topUserScore = leaderboard[0]?.points || 0;

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Leaderboard & Points</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Control
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Manage student rankings, award/deduct points, and add candidates directly to the live leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/leaderboard"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition"
          >
            <ExternalLink className="h-4 w-4" />
            Public View
          </Link>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-900/30"
          >
            <UserPlus className="h-4 w-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Ranked Users</div>
          <div className="text-2xl font-black text-white mt-1">{totalUsers}</div>
          <div className="text-xs text-zinc-500 mt-1">Across all registered accounts</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Highest Score (#1 Rank)</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{topUserScore} pts</div>
          <div className="text-xs text-zinc-500 mt-1">{leaderboard[0]?.name || "N/A"}</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Point Distribution</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">Real-time</div>
          <div className="text-xs text-zinc-500 mt-1">Updates immediately upon award</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name or email..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <button
          onClick={() => { setSearch(""); setPage(1); loadLeaderboard(); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Trophy className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-300">No users found</h3>
          <p className="text-zinc-500 text-sm mt-1">Click &apos;Add Candidate&apos; above to register users and assign points.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Learner</th>
                <th className="px-6 py-4 hidden sm:table-cell">Role</th>
                <th className="px-6 py-4 hidden md:table-cell">DSA Solved</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4 text-right">Quick Award / Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {leaderboard.map((u) => {
                const isGold = u.rank === 1;
                const isSilver = u.rank === 2;
                const isBronze = u.rank === 3;

                return (
                  <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      {isGold ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Trophy className="h-3.5 w-3.5" /> #1
                        </span>
                      ) : isSilver ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-700/30 text-zinc-300 border border-zinc-600/30">
                          #2
                        </span>
                      ) : isBronze ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-800/20 text-amber-500 border border-amber-800/30">
                          #3
                        </span>
                      ) : (
                        <span className="font-mono text-xs font-semibold text-zinc-500 pl-2">
                          #{u.rank}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-xs text-zinc-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 hidden md:table-cell text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-200">{u.problemsSolved || 0}</span> problems
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-base font-extrabold text-amber-400">
                        {u.points} <span className="text-xs font-medium text-zinc-500">pts</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickDelta(u.id, u.name, 50)}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                          title="Add +50 points"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => handleQuickDelta(u.id, u.name, 100)}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition"
                          title="Add +100 points"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => {
                            setEditingUserPoints(u);
                            setCustomPoints(String(u.points));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition flex items-center gap-1"
                          title="Set Custom Points"
                        >
                          <Edit3 className="h-3 w-3" />
                          Set
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Set Custom Points */}
      {editingUserPoints && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel rounded-2xl border border-zinc-700 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Update Points: {editingUserPoints.name}
              </h3>
              <button onClick={() => setEditingUserPoints(null)} className="p-1 text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomPoints} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Total Leaderboard Points
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2">
                {[200, 500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomPoints(String(preset))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingUserPoints(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Save Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Candidate to Leaderboard */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-zinc-700 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-brand-400" />
                Add Candidate to Leaderboard
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="p-1 text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Starting Points</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newUserForm.points}
                    onChange={(e) => setNewUserForm({ ...newUserForm, points: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Create &amp; Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
