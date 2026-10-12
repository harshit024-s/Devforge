"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Key, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { authAPI } from "../../lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = await authAPI.register(formData);
      setMessage({ type: "success", text: "Registration successful! Redirecting to login..." });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Registration failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050505] py-12">
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-2000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 mx-4"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-[2rem]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(38,60,242,0.5)]">
                D
              </div>
              <span className="text-xl font-bold tracking-tight text-white">DevForge</span>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-zinc-400 text-sm">Join the elite coding community.</p>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
            >
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <p className="text-sm font-medium">{message.text}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
                  placeholder="Full Name"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
                  placeholder="Email Address"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
                  placeholder="Password (min 8 characters)"
                  minLength={8}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
                  placeholder="Invite Code (Optional)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
