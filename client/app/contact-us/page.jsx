"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  User,
  MessageSquareText,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Headset,
  MapPin,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { contactAPI } from "../../lib/api";

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    issue: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [responseMessage, setResponseMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validateForm() {
    const newErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Please enter a valid email address";
    if (!form.mobile.trim() || !/^[+]?[\d\s-]{10,15}$/.test(form.mobile))
      newErrors.mobile = "Please enter a valid mobile number (10-15 digits)";
    if (!form.issue.trim() || form.issue.trim().length < 10)
      newErrors.issue = "Please describe your issue (at least 10 characters)";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("loading");
    setErrors({});
    try {
      const res = await contactAPI.submit(form);
      setStatus("success");
      setResponseMessage(
        res.message ||
          "Thank you! We've received your message and will respond within 24 hours."
      );
      setForm({ name: "", email: "", mobile: "", issue: "" });
    } catch (err) {
      setStatus("error");
      setResponseMessage(
        err.message || "Something went wrong. Please try again later."
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-brand-600/15 rounded-full mix-blend-screen filter blur-[140px] animate-blob pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[140px] animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-[350px] h-[350px] bg-cyan-600/8 rounded-full mix-blend-screen filter blur-[140px] animate-blob animation-delay-4000 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
              <Headset className="h-4 w-4 text-brand-400" />
              <span className="text-sm font-medium text-brand-300">
                We're Here to Help
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 leading-[0.95]">
              Contact{" "}
              <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Have a question, issue, or feedback? Drop us a message and our
              team will get back to you within 24 hours.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-16"
          >
            {[
              {
                icon: Mail,
                label: "Email Us",
                value: "devforge010@gmail.com",
                color: "from-blue-500 to-cyan-500",
                href: "mailto:devforge010@gmail.com",
              },
              {
                icon: Clock,
                label: "Response Time",
                value: "Within 24 Hours",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: MapPin,
                label: "Available",
                value: "Mon – Sun, 24/7",
                color: "from-green-500 to-emerald-500",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 text-center"
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-zinc-500 mb-1">{card.label}</p>
                {card.href ? (
                  <a
                    href={card.href}
                    className="text-base font-semibold text-white hover:text-brand-400 transition-colors"
                  >
                    {card.value}
                  </a>
                ) : (
                  <p className="text-base font-semibold text-white">
                    {card.value}
                  </p>
                )}
              </div>
            ))}
          </motion.div>

          {/* Main Form + Side Panel */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <MessageSquareText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Send Us a Message
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Fill out the form below and we'll respond promptly
                    </p>
                  </div>
                </div>

                {/* Success / Error banner */}
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-300">
                        Message Sent Successfully!
                      </p>
                      <p className="text-xs text-emerald-400/70 mt-1">
                        {responseMessage}
                      </p>
                    </div>
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-300">
                        Failed to Send
                      </p>
                      <p className="text-xs text-red-400/70 mt-1">
                        {responseMessage}
                      </p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                      <User className="h-4 w-4 text-zinc-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border ${
                        errors.name
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/[0.08] focus:border-brand-500/50"
                      } text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "focus:ring-red-500/20"
                          : "focus:ring-brand-500/20"
                      } transition-all`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1.5">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                      <Mail className="h-4 w-4 text-zinc-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border ${
                        errors.email
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/[0.08] focus:border-brand-500/50"
                      } text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "focus:ring-red-500/20"
                          : "focus:ring-brand-500/20"
                      } transition-all`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1.5">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                      <Phone className="h-4 w-4 text-zinc-500" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border ${
                        errors.mobile
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/[0.08] focus:border-brand-500/50"
                      } text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 ${
                        errors.mobile
                          ? "focus:ring-red-500/20"
                          : "focus:ring-brand-500/20"
                      } transition-all`}
                    />
                    {errors.mobile && (
                      <p className="text-xs text-red-400 mt-1.5">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Issue */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                      <MessageSquareText className="h-4 w-4 text-zinc-500" />
                      Describe Your Issue
                    </label>
                    <textarea
                      name="issue"
                      value={form.issue}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us what you need help with..."
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border ${
                        errors.issue
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/[0.08] focus:border-brand-500/50"
                      } text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 ${
                        errors.issue
                          ? "focus:ring-red-500/20"
                          : "focus:ring-brand-500/20"
                      } transition-all resize-none`}
                    />
                    {errors.issue && (
                      <p className="text-xs text-red-400 mt-1.5">
                        {errors.issue}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="group w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-brand-600 text-white font-semibold text-base hover:bg-brand-500 transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(70,100,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {status === "loading" ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Side Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Response Time Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-600/10 to-purple-600/10 border border-brand-500/15 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    24-Hour Response
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Our support team is committed to responding to every inquiry
                  within <strong className="text-brand-300">24 hours</strong>.
                  We value your time and take every message seriously.
                </p>
              </div>

              {/* Direct Email Card */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Email Directly
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  Prefer sending an email directly? Reach us at:
                </p>
                <a
                  href="mailto:devforge010@gmail.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  devforge010@gmail.com
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* FAQ hint */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Quick Tips</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">•</span>
                    Include your registered email for faster resolution
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">•</span>
                    Describe the issue with steps to reproduce
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">•</span>
                    Mention the course or problem name if applicable
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-400 mt-1">•</span>
                    For payment issues, include transaction ID
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
                D
              </div>
              <span className="font-bold text-zinc-400">DevForge</span>
            </div>
            <p className="text-sm text-zinc-600">
              © 2026 DevForge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
