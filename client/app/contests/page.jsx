"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Swords, Calendar, Clock, Users, ArrowRight, 
  Sparkles, CheckCircle2, Shield, AlertCircle 
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { contestsAPI } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

export default function ContestsPage() {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadContests();
  }, []);

  async function loadContests() {
    try {
      setLoading(true);
      const res = await contestsAPI.getAll();
      setContests(res.data.contests);
    } catch (err) {
      console.error("Failed to load contests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(contestId) {
    if (!user) {
      setNotification({
        type: "error",
        message: "Please sign in to register for competitions.",
      });
      return;
    }

    try {
      setRegisteringId(contestId);
      await contestsAPI.register(contestId, user.id);
      setNotification({
        type: "success",
        message: "You are officially registered! Good luck in the competition.",
      });
      loadContests();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Registration failed.",
      });
    } finally {
      setRegisteringId(null);
    }
  }

  const liveContests = contests.filter((c) => c.status === "LIVE");
  const upcomingContests = contests.filter((c) => c.status === "UPCOMING");
  const endedContests = contests.filter((c) => c.status === "ENDED");

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 mb-12 glass-panel border border-brand-500/20 bg-gradient-to-r from-brand-950/40 via-purple-950/20 to-zinc-950">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
              <Swords className="h-4 w-4" />
              Competitive Programming Arena
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              DevForge <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Coding Contests</span>
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg mt-3 leading-relaxed">
              Compete against top developers in timed algorithmic sprint battles. Solve challenges, scale the global leaderboard, and win recognition.
            </p>
          </div>
        </div>

        {notification && (
          <div className={`p-4 rounded-2xl mb-8 flex items-center justify-between border text-sm ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="font-bold ml-4">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            
            {liveContests.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">Active Contests (Live Now)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveContests.map((c) => (
                    <ContestCard
                      key={c.id}
                      contest={c}
                      onRegister={() => handleRegister(c.id)}
                      registering={registeringId === c.id}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Upcoming Challenges</h2>
              {upcomingContests.length === 0 ? (
                <div className="glass-panel p-8 text-center rounded-2xl text-zinc-500 text-sm">
                  No upcoming contests scheduled right now. Check back soon!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingContests.map((c) => (
                    <ContestCard
                      key={c.id}
                      contest={c}
                      onRegister={() => handleRegister(c.id)}
                      registering={registeringId === c.id}
                    />
                  ))}
                </div>
              )}
            </section>

            {endedContests.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-zinc-400 tracking-tight mb-6">Past Contests</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75">
                  {endedContests.map((c) => (
                    <ContestCard key={c.id} contest={c} isEnded />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ContestCard({ contest, onRegister, registering, isEnded }) {
  const startDate = new Date(contest.startTime);
  const isLive = contest.status === "LIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl overflow-hidden border border-zinc-800/80 flex flex-col hover:border-brand-500/30 transition-all duration-300"
    >
      <div className="aspect-[16/9] bg-zinc-900 relative overflow-hidden">
        {contest.bannerUrl ? (
          <img
            src={contest.bannerUrl}
            alt={contest.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <Swords className="h-12 w-12 text-zinc-700" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
            isLive
              ? "bg-rose-500/90 text-white animate-pulse"
              : isEnded
              ? "bg-zinc-800/90 text-zinc-400"
              : "bg-brand-600/90 text-white"
          }`}>
            {contest.status}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-lg text-white mb-2 line-clamp-1">{contest.title}</h3>
          <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {contest.description}
          </p>

          <div className="space-y-2 text-xs text-zinc-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-400" />
              <span>{startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>{contest.duration} Minutes Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>{contest.participantsCount || 0} Registered Developers</span>
            </div>
          </div>
        </div>

        <div>
          {isLive ? (
            <Link
              href="/practice"
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/40"
            >
              Enter Contest Arena Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : isEnded ? (
            <Link
              href="/leaderboard"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              View Contest Standings
            </Link>
          ) : (
            <button
              onClick={onRegister}
              disabled={registering}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-brand-950/30"
            >
              {registering ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Register for Contest
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
