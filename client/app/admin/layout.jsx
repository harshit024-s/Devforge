"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Code2, 
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Swords,
  Trophy
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Courses & Media", href: "/admin/courses", icon: Video },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "DSA Problems", href: "/admin/problems", icon: Code2 },
  { name: "Contests", href: "/admin/contests", icon: Swords },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login?error=admin_required");
    }
  }, [user, loading, router]);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-semibold">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#050505] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/20 text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Access Denied</h2>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              This area is strictly restricted to verified administrators only. Please log in with your designated admin email.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
            >
              Sign In to Admin Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
      
      <aside className="w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-zinc-900 shrink-0 justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(38,60,242,0.5)]">
              D
            </div>
            <span className="text-xl font-bold tracking-tight text-white">DevForge</span>
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-4 mt-4">
            Admin Panel
          </div>
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[inset_0_0_20px_rgba(70,100,255,0.05)]"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-brand-400" : "text-zinc-500"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 mt-6 border-t border-zinc-900">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Student Site
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-900 shrink-0">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-rose-400 transition-all w-full border border-transparent"
          >
            <LogOut className="h-5 w-5 text-zinc-500" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-900/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />

        <header className="h-20 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900/50 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search across DevForge..." 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 pl-6">
            <div className="flex items-center gap-3 pl-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-white">{user?.name || "Admin"}</div>
                <div className="text-zinc-500">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
