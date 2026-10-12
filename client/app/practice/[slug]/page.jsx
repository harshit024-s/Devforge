"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Code2 } from "lucide-react";
import Navbar from "../../../components/Navbar";
import DsaProblemWorkspace from "../../../components/DsaProblemWorkspace";
import { problemsAPI } from "../../../lib/api";

export default function PracticeProblemPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadProblem();
    }
  }, [slug]);

  async function loadProblem() {
    try {
      setLoading(true);
      const res = await problemsAPI.getBySlug(slug);
      if (res?.data?.problem) {
        setProblem(res.data.problem);
      }
    } catch (err) {
      console.error("Failed to load problem:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Code2 className="h-16 w-16 text-zinc-700 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-200 mb-2">Problem not found</h2>
          <p className="text-zinc-500 mb-6">The problem you are looking for does not exist or has been removed.</p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Practice Arena
          </Link>
        </div>
      </div>
    );
  }

  return <DsaProblemWorkspace problem={problem} />;
}
