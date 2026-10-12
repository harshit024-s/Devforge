"use client";

import { useState, useRef } from "react";

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];
const MAX_FILE_SIZE = 500 * 1024 * 1024;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VideoUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [uploadedKey, setUploadedKey] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function resetState() {
    setFile(null);
    setProgress(0);
    setStatus("idle");
    setUploadedKey("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelect(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError("");
    setStatus("idle");
    setUploadedKey("");

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Invalid file type. Please select an MP4, WebM, MOV, or AVI file.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 500MB.");
      return;
    }

    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setStatus("requesting");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/get-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to get upload URL");
      }

      setStatus("uploading");

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", data.data.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      setStatus("success");
      setUploadedKey(data.data.key);
    } catch (err) {
      setStatus("error");
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-transparent rounded-2xl overflow-hidden">
        <div className="px-2 py-4 border-b border-zinc-800/50">
          <h2 className="text-lg font-semibold text-zinc-100">Select Video File</h2>
          <p className="text-sm text-zinc-500 mt-1">
            MP4, WebM, MOV, or AVI — up to 500MB
          </p>
        </div>

        <div className="py-6 space-y-5">
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-colors duration-200
              ${file
                ? "border-brand-500/50 bg-brand-500/10"
                : "border-zinc-700 bg-zinc-900/50 hover:border-brand-500 hover:bg-brand-500/5"
              }
              ${uploading ? "pointer-events-none opacity-60" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!file ? (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p className="mt-3 text-sm font-medium text-zinc-300">
                  Click to select a video file
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="h-8 w-8 text-brand-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-200 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
            )}
          </div>

          {status === "uploading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Uploading to S3...</span>
                <span className="font-medium text-brand-400">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <svg
                className="h-5 w-5 text-green-400 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-400">Upload successful</p>
                <p className="text-xs text-green-500/70 mt-1 break-all font-mono">
                  {uploadedKey}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${
                  !file || uploading
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-brand-600 text-white hover:bg-brand-500 active:scale-[0.98] shadow-sm"
                }
              `}
            >
              {uploading
                ? status === "requesting"
                  ? "Preparing..."
                  : `Uploading ${progress}%`
                : "Upload to S3"}
            </button>

            {(file || status === "success") && !uploading && (
              <button
                onClick={resetState}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
