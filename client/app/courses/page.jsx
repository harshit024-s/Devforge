"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Users, Clock, Search, Filter } from "lucide-react";
import Navbar from "../../components/Navbar";
import { coursesAPI } from "../../lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await coursesAPI.getAll({ search: search || undefined });
      setCourses(data.data.courses);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    loadCourses();
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Browse <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">Courses</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Explore our curated collection of expert-led courses designed to level up your development skills.
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <div className="relative max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            />
          </div>
        </motion.form>

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No Courses Yet</h3>
            <p className="text-zinc-500">Courses will appear here once they&apos;re published by an instructor.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/courses/${course.slug}`} className="block group">
                  <div className="glass-panel rounded-2xl overflow-hidden hover:border-brand-500/30 transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900/50 to-purple-900/50">
                          <BookOpen className="h-12 w-12 text-brand-500/50" />
                        </div>
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          course.price > 0
                            ? "bg-brand-600/90 text-white"
                            : "bg-green-600/90 text-white"
                        }`}>
                          {course.price > 0 ? `$${course.price}` : "Free"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {course._count?.enrollments || 0} enrolled
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {course._count?.modules || 0} modules
                        </div>
                      </div>
                      {course.instructor && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800/50">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                            {course.instructor.name?.charAt(0) || "I"}
                          </div>
                          <span className="text-xs text-zinc-400">{course.instructor.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
