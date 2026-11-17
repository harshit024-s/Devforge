"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, ChevronDown, ChevronUp,
  Save, X, Video, GripVertical, FileText
} from "lucide-react";
import { adminCoursesAPI, modulesAPI, lessonsAPI } from "../../../lib/api";
import VideoUploader from "../../../components/VideoUploader";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const [newCourse, setNewCourse] = useState({
    title: "", description: "", price: "0", thumbnailUrl: "", isPublished: false,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await adminCoursesAPI.getAll();
      setCourses(data.data.courses);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    try {
      await adminCoursesAPI.create(newCourse);
      setNewCourse({ title: "", description: "", price: "0", thumbnailUrl: "", isPublished: false });
      setShowCreateForm(false);
      loadCourses();
    } catch (err) {
      alert("Failed to create course: " + err.message);
    }
  }

  async function handleUpdateLesson(id, data) {
    try {
      await lessonsAPI.update(id, data);
      setEditingLesson(null);
      loadCourses();
    } catch (err) {
      alert("Failed to update lesson: " + err.message);
    }
  }

  async function handleUpdateCourse(id, data) {
    try {
      await adminCoursesAPI.update(id, data);
      setEditingCourse(null);
      loadCourses();
    } catch (err) {
      alert("Failed to update course: " + err.message);
    }
  }

  async function handleDeleteCourse(id) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await adminCoursesAPI.delete(id);
      loadCourses();
    } catch (err) {
      alert("Failed to delete course: " + err.message);
    }
  }

  async function handleTogglePublish(course) {
    await handleUpdateCourse(course.id, { isPublished: !course.isPublished });
  }

  async function handleAddModule(courseId) {
    try {
      await modulesAPI.create(courseId, { title: "New Module" });
      loadCourses();
    } catch (err) {
      alert("Failed to create module: " + err.message);
    }
  }

  async function handleUpdateModule(id, data) {
    try {
      await modulesAPI.update(id, data);
      loadCourses();
    } catch (err) {
      alert("Failed to update module: " + err.message);
    }
  }

  async function handleDeleteModule(id) {
    if (!confirm("Delete this module and all its lessons?")) return;
    try {
      await modulesAPI.delete(id);
      loadCourses();
    } catch (err) {
      alert("Failed to delete module: " + err.message);
    }
  }

  async function handleAddLesson(moduleId) {
    try {
      await lessonsAPI.create(moduleId, { title: "New Lesson" });
      loadCourses();
    } catch (err) {
      alert("Failed to create lesson: " + err.message);
    }
  }

  async function handleDeleteLesson(id) {
    if (!confirm("Delete this lesson?")) return;
    try {
      await lessonsAPI.delete(id);
      loadCourses();
    } catch (err) {
      alert("Failed to delete lesson: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Courses & Media</h1>
          <p className="text-zinc-400 mt-1">Manage courses, modules, lessons, and upload media.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all border border-zinc-700"
          >
            <Video className="h-4 w-4" />
            Upload Media
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Course
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Upload Video to S3</h2>
            <VideoUploader />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <form onSubmit={handleCreateCourse} className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Create New Course</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Course Title"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                  placeholder="Price (0 = free)"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
              <input
                type="url"
                value={newCourse.thumbnailUrl}
                onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                placeholder="Thumbnail Image URL (optional)"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              />
              <textarea
                required
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Course Description"
                rows={3}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCourse.isPublished}
                    onChange={(e) => setNewCourse({ ...newCourse, isPublished: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-brand-500"
                  />
                  <span className="text-sm text-zinc-400">Publish immediately</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 transition-all"
                >
                  <Save className="h-4 w-4" />
                  Create Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {courses.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <BookOpen className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-400 mb-2">No Courses</h3>
          <p className="text-zinc-500 mb-6">Create your first course to get started.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create First Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              layout
              className="glass-panel rounded-2xl overflow-hidden"
            >
              
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                    className="p-1 rounded hover:bg-zinc-800 transition-colors shrink-0"
                  >
                    {expandedCourse === course.id ? (
                      <ChevronUp className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{course.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        course.isPublished
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-zinc-800 text-zinc-500 border-zinc-700"
                      }`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {course._count?.modules || 0} modules · {course._count?.enrollments || 0} enrollments · ${course.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className={`p-2 rounded-lg transition-all ${
                      course.isPublished
                        ? "text-green-400 hover:bg-green-500/10"
                        : "text-zinc-500 hover:bg-zinc-800"
                    }`}
                    title={course.isPublished ? "Unpublish" : "Publish"}
                  >
                    {course.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedCourse === course.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-800/50"
                  >
                    <div className="p-5 space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <EditableField
                          label="Title"
                          value={course.title}
                          onSave={(val) => handleUpdateCourse(course.id, { title: val })}
                        />
                        <EditableField
                          label="Price ($)"
                          value={String(course.price)}
                          type="number"
                          onSave={(val) => handleUpdateCourse(course.id, { price: val })}
                        />
                        <EditableField
                          label="Thumbnail URL"
                          value={course.thumbnailUrl || ""}
                          onSave={(val) => handleUpdateCourse(course.id, { thumbnailUrl: val })}
                        />
                      </div>
                      <EditableField
                        label="Description"
                        value={course.description}
                        multiline
                        onSave={(val) => handleUpdateCourse(course.id, { description: val })}
                      />

                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-zinc-300">Modules</h4>
                          <button
                            onClick={() => handleAddModule(course.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
                          >
                            <Plus className="h-3 w-3" />
                            Add Module
                          </button>
                        </div>

                        {course.modules?.length === 0 ? (
                          <p className="text-sm text-zinc-600 py-4 text-center">No modules yet. Add your first module.</p>
                        ) : (
                          <div className="space-y-3">
                            {course.modules?.map((mod, mi) => (
                              <div key={mod.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">{mi + 1}</span>
                                    <EditableField
                                      value={mod.title}
                                      onSave={(val) => handleUpdateModule(mod.id, { title: val })}
                                      inline
                                    />
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleAddLesson(mod.id)}
                                      className="p-1.5 rounded text-zinc-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                                      title="Add Lesson"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteModule(mod.id)}
                                      className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                      title="Delete Module"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {mod.lessons?.length > 0 && (
                                  <div className="space-y-2 ml-6">
                                    {mod.lessons.map((lesson, li) => (
                                      <div key={lesson.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-3.5 w-3.5 text-zinc-600" />
                                          <span className="text-sm text-zinc-300">{lesson.title}</span>
                                          {lesson.videoUrl && (
                                            <Video className="h-3 w-3 text-brand-400" />
                                          )}
                                          {lesson.isPreview && (
                                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400">Preview</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => setEditingLesson(lesson)}
                                            className="p-1 rounded text-zinc-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                                            title="Edit Lesson Details (Video URL, Content)"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            title="Delete Lesson"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {editingLesson && (
        <LessonEditModal
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSave={(data) => handleUpdateLesson(editingLesson.id, data)}
        />
      )}
    </div>
  );
}

function LessonEditModal({ lesson, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: lesson.title || "",
    videoUrl: lesson.videoUrl || "",
    content: lesson.content || "",
    duration: lesson.duration || "",
    isPreview: lesson.isPreview || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-zinc-700/80 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-brand-400" />
            Edit Lesson Details
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Lesson Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Video Stream / Storage URL</label>
            <input
              type="text"
              placeholder="e.g. courses/videos/xxx.mp4 or https://..."
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Paste the S3 key from Media Uploader or any direct video link.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-brand-500"
                />
                <span className="text-xs font-semibold text-zinc-300">Free Preview Lesson</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Lesson Content / Notes (Markdown supported)</label>
            <textarea
              rows={4}
              placeholder="Add lesson summary, code snippets, or notes..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditableField({ label, value, onSave, type = "text", multiline = false, inline = false }) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  function handleSave() {
    if (tempValue !== value) {
      onSave(tempValue);
    }
    setEditing(false);
  }

  function handleCancel() {
    setTempValue(value);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div
        className={`group cursor-pointer ${inline ? "inline-flex items-center gap-1" : ""}`}
        onClick={() => { setTempValue(value); setEditing(true); }}
      >
        {label && <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">{label}</label>}
        <div className={`text-sm text-zinc-300 ${inline ? "font-semibold" : "p-2 rounded-lg bg-zinc-900/50 border border-transparent hover:border-zinc-800"} transition-all`}>
          {value || <span className="text-zinc-600 italic">Click to edit</span>}
        </div>
        <Pencil className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity inline ml-1" />
      </div>
    );
  }

  return (
    <div>
      {label && <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">{label}</label>}
      <div className="flex gap-2">
        {multiline ? (
          <textarea
            autoFocus
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            rows={3}
            className="flex-1 bg-zinc-900 border border-brand-500/50 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
            onKeyDown={(e) => { if (e.key === "Escape") handleCancel(); }}
          />
        ) : (
          <input
            autoFocus
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="flex-1 bg-zinc-900 border border-brand-500/50 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
        )}
        <button onClick={handleSave} className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-all">
          <Save className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleCancel} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
