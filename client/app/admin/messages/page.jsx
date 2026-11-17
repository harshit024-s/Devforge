"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Inbox,
  X,
} from "lucide-react";
import { adminContactAPI } from "../../../lib/api";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | pending | responded
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      const res = await adminContactAPI.getAll();
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setNotification({ type: "error", message: "Failed to load contact messages." });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleResponded(id) {
    try {
      const res = await adminContactAPI.toggleResponded(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? res.data : m))
      );
      const msg = res.data;
      setNotification({
        type: "success",
        message: msg.isResponded
          ? "Message marked as responded."
          : "Message marked as pending.",
      });
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to update message." });
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete message from "${name}"? This cannot be undone.`)) return;
    try {
      await adminContactAPI.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) setExpandedId(null);
      setNotification({ type: "success", message: `Message from "${name}" deleted.` });
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Failed to delete message." });
    }
  }

  const filteredMessages = messages.filter((m) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !m.isResponded) ||
      (filter === "responded" && m.isResponded);

    const matchesSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.issue.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = messages.filter((m) => !m.isResponded).length;
  const respondedCount = messages.filter((m) => m.isResponded).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Contact Messages
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          View and manage messages submitted through the Contact Us form.
        </p>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="font-bold ml-4">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{messages.length}</p>
              <p className="text-xs text-zinc-500 font-medium">Total Messages</p>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-xs text-zinc-500 font-medium">Pending Response</p>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{respondedCount}</p>
              <p className="text-xs text-zinc-500 font-medium">Responded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, or issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {["all", "pending", "responded"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                filter === f
                  ? "bg-brand-500/10 text-brand-400 border-brand-500/20"
                  : "text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              {f === "all"
                ? `All (${messages.length})`
                : f === "pending"
                ? `Pending (${pendingCount})`
                : `Responded (${respondedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-300">No messages found</h3>
          <p className="text-zinc-500 text-sm mt-1">
            {searchQuery || filter !== "all"
              ? "Try adjusting your search or filter."
              : "No contact form submissions yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMessages.map((msg, index) => {
              const isExpanded = expandedId === msg.id;
              const date = new Date(msg.createdAt);

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className={`glass-panel rounded-2xl border overflow-hidden transition-colors ${
                    msg.isResponded
                      ? "border-zinc-800/60"
                      : "border-amber-500/20 bg-amber-500/[0.02]"
                  }`}
                >
                  {/* Message header row */}
                  <div
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-zinc-900/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                  >
                    {/* Status indicator */}
                    <div
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        msg.isResponded ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                      }`}
                    />

                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">
                          {msg.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            msg.isResponded
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {msg.isResponded ? "RESPONDED" : "PENDING"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {msg.issue}
                      </p>
                    </div>

                    {/* Date & expand toggle */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-zinc-500 hidden sm:block">
                        {date.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {date.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-2 border-t border-zinc-800/60 space-y-4">
                          {/* Contact details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-zinc-500" />
                              <a
                                href={`mailto:${msg.email}`}
                                className="text-brand-400 hover:text-brand-300 transition-colors"
                              >
                                {msg.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-zinc-500" />
                              <span className="text-zinc-300">{msg.mobile}</span>
                            </div>
                          </div>

                          {/* Issue */}
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                              Issue Description
                            </h4>
                            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/60">
                              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {msg.issue}
                              </p>
                            </div>
                          </div>

                          {/* Message ID */}
                          <p className="text-[11px] text-zinc-600 font-mono">
                            ID: {msg.id}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleResponded(msg.id);
                              }}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                msg.isResponded
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              }`}
                            >
                              {msg.isResponded ? (
                                <>
                                  <Clock className="h-3.5 w-3.5" />
                                  Mark as Pending
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Mark as Responded
                                </>
                              )}
                            </button>

                            <a
                              href={`mailto:${msg.email}?subject=Re: Your DevForge Contact Message&body=Hi ${msg.name},%0A%0AThank you for reaching out to DevForge.%0A%0A`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-all"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Reply via Email
                            </a>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(msg.id, msg.name);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all ml-auto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
