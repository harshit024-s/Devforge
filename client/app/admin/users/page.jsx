"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Search, Shield, Trash2, Award, UserCheck, 
  Mail, Calendar, ArrowUpDown, Filter, Sparkles 
} from "lucide-react";
import { adminUsersAPI } from "../../../lib/api";

const ROLE_BADGES = {
  ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  INSTRUCTOR: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  STUDENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, page]);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await adminUsersAPI.getAll({
        search: search || undefined,
        role: roleFilter || undefined,
        page,
      });
      setUsers(res.data.users);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load users:", err);
      setNotification({ type: "error", message: "Failed to load users list." });
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  async function handleRoleChange(userId, newRole) {
    try {
      await adminUsersAPI.updateRole(userId, newRole);
      setNotification({ type: "success", message: `User role updated to ${newRole}.` });
      loadUsers();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to update role." });
    }
  }

  async function handleDeleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminUsersAPI.delete(userId);
      setNotification({ type: "success", message: `User "${userName}" has been deleted.` });
      loadUsers();
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to delete user." });
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
        <p className="text-zinc-400 text-sm mt-1">
          View all registered accounts, change user roles, and monitor learner progress.
        </p>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          {["", "ADMIN", "INSTRUCTOR", "STUDENT"].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                roleFilter === r
                  ? "bg-brand-500/10 text-brand-400 border-brand-500/30"
                  : "bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              {r || "All Roles"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-300">No users found</h3>
          <p className="text-zinc-500 text-sm mt-1">Try adjusting your search criteria or role filters.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 hidden sm:table-cell">Points</th>
                <th className="px-6 py-4 hidden md:table-cell">Referral Code</th>
                <th className="px-6 py-4 hidden lg:table-cell">Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
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

                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-zinc-900 focus:outline-none cursor-pointer ${
                        ROLE_BADGES[u.role] || ""
                      }`}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="INSTRUCTOR">INSTRUCTOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 hidden sm:table-cell font-medium text-amber-400">
                    {u.points} pts
                  </td>

                  <td className="px-6 py-4 hidden md:table-cell font-mono text-xs text-zinc-400">
                    {u.referralCode}
                  </td>

                  <td className="px-6 py-4 hidden lg:table-cell text-xs text-zinc-400">
                    <span>{u._count?.enrollments || 0} enrolled</span>
                    <span className="mx-1.5">•</span>
                    <span>{u._count?.submissions || 0} submissions</span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
    </div>
  );
}
