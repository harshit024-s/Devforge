import Link from "next/link";
import { Heart, Code2, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 overflow-hidden">
      {/* Background glow subtle effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-cyan-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-800/60">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-[0_0_20px_rgba(70,100,255,0.4)]">
                D
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">DevForge</span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              The premier interactive platform for software engineers. Master Data Structures & Algorithms, conquer biweekly contests, and build real-world software.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-medium text-brand-300">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span>Engineered for next-generation coders</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/practice" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>DSA Practice Arena</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-brand-400 transition-colors">
                  Structured Courses
                </Link>
              </li>
              <li>
                <Link href="/contests" className="hover:text-brand-400 transition-colors">
                  Coding Contests
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-brand-400 transition-colors">
                  Global Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support & Team</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact-us" className="hover:text-brand-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-brand-400 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <span className="text-zinc-500 text-xs block pt-2">
                  Have feedback or questions? Reach out to our engineering team anytime.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>© {new Date().getFullYear()} DevForge. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 shadow-inner">
            <Code2 className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-medium text-zinc-200">
              Built with <Heart className="inline h-3.5 w-3.5 text-rose-500 fill-rose-500 mx-0.5" /> by DevForge Team
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
