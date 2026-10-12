"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Users, Zap, Trophy, Shield } from "lucide-react";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description: "Learn from industry professionals with structured, project-based courses.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Code2,
    title: "DSA Practice Arena",
    description: "Sharpen your skills with 500+ coding challenges with live code execution.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Trophy,
    title: "Earn Points & Rank Up",
    description: "Solve problems, complete courses, and climb the leaderboard.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Real-Time Code Runner",
    description: "Execute code in JavaScript, Python, C++, and Java instantly.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Referral Rewards",
    description: "Invite friends and earn discounts on premium courses.",
    color: "from-rose-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Admin Dashboard",
    description: "Full course management with live stats and media uploads.",
    color: "from-indigo-500 to-violet-500",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <section className="relative overflow-hidden">
        
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/20 rounded-full mix-blend-screen filter blur-[140px] animate-blob pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full mix-blend-screen filter blur-[140px] animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[140px] animate-blob animation-delay-4000 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 sm:pt-32 sm:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
              <Zap className="h-4 w-4 text-brand-400" />
              <span className="text-sm font-medium text-brand-300">Next-Gen Learning Platform</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[0.95]">
              Master Code.
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Build the Future.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Structured courses, hands-on DSA practice, and a real-time code playground — 
              everything you need to become an elite developer.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 text-white font-semibold text-lg hover:bg-brand-500 transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(70,100,255,0.3)]"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/courses"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 text-zinc-300 font-semibold text-lg hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800"
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: "Courses", value: "10+" },
              { label: "DSA Problems", value: "500+" },
              { label: "Active Users", value: "2K+" },
              { label: "Languages", value: "4" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent"> Level Up</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              A complete ecosystem for learning, practicing, and mastering software development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/30 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of developers who are leveling up their skills with DevForge.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-500 transition-all shadow-[0_0_60px_rgba(70,100,255,0.25)]"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
                D
              </div>
              <span className="font-bold text-zinc-400">DevForge</span>
            </div>
            <p className="text-sm text-zinc-600">© 2026 DevForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
