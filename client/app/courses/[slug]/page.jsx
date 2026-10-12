"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Clock, Users, Play, Lock, ChevronDown, ChevronUp, 
  ArrowLeft, CheckCircle2, X, Sparkles, ExternalLink 
} from "lucide-react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { coursesAPI } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (slug) loadCourse();
  }, [slug]);

  useEffect(() => {
    if (course && user) {
      checkEnrollment();
    }
  }, [course, user]);

  async function checkEnrollment() {
    try {
      const res = await coursesAPI.getEnrollmentStatus(course.id, user.id);
      setIsEnrolled(res.enrolled);
    } catch (e) {
      console.error("Failed to check enrollment:", e);
    }
  }

  async function loadCourse() {
    try {
      const data = await coursesAPI.getBySlug(slug);
      const c = data.data.course;
      setCourse(c);
      if (c.modules?.[0]) {
        setExpandedModules({ [c.modules[0].id]: true });
      }
    } catch (err) {
      console.error("Failed to load course:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleModule(moduleId) {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }

  async function handleEnroll() {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setEnrolling(true);
      await coursesAPI.enroll(course.id, user.id);
      setIsEnrolled(true);
      setNotification({
        type: "success",
        title: "Successfully Enrolled!",
        message: "You now have full lifetime access to all lessons in this course.",
      });
    } catch (err) {
      setNotification({
        type: "error",
        title: "Enrollment Failed",
        message: err.message || "Failed to process enrollment.",
      });
    } finally {
      setEnrolling(false);
    }
  }

  function handleLessonClick(lesson) {
    if (lesson.isPreview || isEnrolled) {
      setActiveLesson(lesson);
    } else {
      setNotification({
        type: "info",
        title: "Lesson Locked",
        message: "Enroll in this course to unlock this lesson and its materials.",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <Navbar />
        <div className="text-center py-32">
          <h2 className="text-2xl font-bold text-zinc-400">Course not found</h2>
          <Link href="/courses" className="text-brand-400 mt-4 inline-block hover:underline">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const totalDuration = course.modules?.reduce(
    (acc, m) => acc + m.lessons?.reduce((a, l) => a + (l.duration || 0), 0),
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/30 via-zinc-950/40 to-[#050505] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-brand-400 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {isEnrolled && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Enrolled in this Course
                  </div>
                )}

                <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  {course.title}
                </h1>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
                  {course.instructor && (
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {course.instructor.name?.charAt(0) || "I"}
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Instructor</div>
                        <span className="font-medium text-zinc-200">{course.instructor.name}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <Users className="h-4 w-4 text-brand-400" />
                    <span>{course._count?.enrollments || 0} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  {totalDuration > 0 && (
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span>{Math.round(totalDuration / 60)}h {totalDuration % 60}m</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Price & Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-panel rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="text-4xl font-extrabold text-white mb-2">
                {isEnrolled ? (
                  <span className="text-emerald-400 text-3xl flex items-center gap-2">
                    <CheckCircle2 className="h-7 w-7" /> Active
                  </span>
                ) : course.price > 0 ? (
                  `$${course.price}`
                ) : (
                  "Free"
                )}
              </div>

              {!isEnrolled && course.price > 0 && (
                <p className="text-xs text-zinc-500 mb-6">One-time payment • Lifetime access</p>
              )}

              <button
                onClick={isEnrolled ? () => {
                  const firstLesson = course.modules?.[0]?.lessons?.[0];
                  if (firstLesson) setActiveLesson(firstLesson);
                } : handleEnroll}
                disabled={enrolling}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${
                  isEnrolled
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"
                    : "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/30"
                }`}
              >
                {enrolling ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isEnrolled ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume Learning
                  </>
                ) : course.price > 0 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Enroll Now (${course.price})
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Start Learning Free
                  </>
                )}
              </button>

              <div className="mt-6 space-y-3 text-sm text-zinc-400 border-t border-zinc-800/60 pt-4">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-brand-400" />
                  <span>{course.modules?.length || 0} modules, {totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Play className="h-4 w-4 text-purple-400" />
                  <span>Interactive lesson videos & notes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Certificate upon completion</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className={`p-4 rounded-xl flex items-center justify-between border ${
            notification.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : notification.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : "bg-blue-500/10 border-blue-500/20 text-blue-300"
          }`}>
            <div>
              <p className="font-semibold text-sm">{notification.title}</p>
              <p className="text-xs opacity-90">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Course Curriculum */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>

        {course.modules?.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <BookOpen className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No modules have been added to this course yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules?.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-xl overflow-hidden border border-zinc-800/60"
              >
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded">
                      Module {i + 1}
                    </span>
                    <span className="font-semibold text-white">{mod.title}</span>
                    <span className="text-xs text-zinc-500 hidden sm:inline">
                      • {mod.lessons?.length || 0} lessons
                    </span>
                  </div>
                  {expandedModules[mod.id] ? (
                    <ChevronUp className="h-5 w-5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-zinc-400" />
                  )}
                </button>

                {expandedModules[mod.id] && mod.lessons?.length > 0 && (
                  <div className="border-t border-zinc-800/50 divide-y divide-zinc-800/40">
                    {mod.lessons.map((lesson, j) => {
                      const canPlay = lesson.isPreview || isEnrolled;
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`flex items-center justify-between px-6 py-4 transition-colors cursor-pointer ${
                            canPlay ? "hover:bg-brand-500/5" : "hover:bg-zinc-900/40 opacity-70"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`p-2 rounded-lg ${
                              canPlay ? "bg-brand-500/10 text-brand-400" : "bg-zinc-800 text-zinc-500"
                            }`}>
                              {canPlay ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-zinc-200">
                                  {j + 1}. {lesson.title}
                                </span>
                                {lesson.isPreview && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {lesson.duration && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}m
                              </span>
                            )}
                            {canPlay && (
                              <span className="text-xs text-brand-400 font-medium hidden sm:inline">
                                Watch →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Player Modal */}
      <AnimatePresence>
        {activeLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden border border-zinc-700/60 shadow-2xl bg-zinc-950 flex flex-col max-h-[90vh]"
            >
              <div className="p-4 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-brand-400" />
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    {activeLesson.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Video Player */}
                {activeLesson.videoUrl ? (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg">
                    <video
                      controls
                      autoPlay
                      src={activeLesson.videoUrl}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-zinc-900/60 rounded-xl flex flex-col items-center justify-center border border-zinc-800 text-center p-8">
                    <BookOpen className="h-12 w-12 text-brand-400 mb-3" />
                    <p className="text-zinc-200 font-medium">Text-Based Reading Lesson</p>
                    <p className="text-zinc-500 text-xs mt-1">Review the curriculum notes and code snippets below.</p>
                  </div>
                )}

                {/* Lesson Notes / Content */}
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800/60">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    Lesson Overview & Notes
                  </h4>
                  <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {activeLesson.content || "No supplemental notes for this lesson."}
                  </div>
                </div>
              </div>

              <div className="p-4 px-6 border-t border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
                <span className="text-xs text-zinc-500">
                  DevForge Interactive Player
                </span>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-all"
                >
                  Close Lesson
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
