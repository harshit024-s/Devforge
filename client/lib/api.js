const configuredApiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_BASE = (/^https?:\/\//i.test(configuredApiBase)
  ? configuredApiBase
  : `https://${configuredApiBase}`).replace(/\/+$/, "");

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("devforge_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || `API error: ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const authAPI = {
  login: (email, password) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (formData) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    }),

  getUser: (userId) => apiFetch(`/api/auth/me/${userId}`),
};

export const dashboardAPI = {
  getStats: () => apiFetch("/api/dashboard/stats"),
  getPublicStats: () => apiFetch("/api/dashboard/public-stats"),
};

export const adminCoursesAPI = {
  getAll: () => apiFetch("/api/admin/courses"),
  getOne: (id) => apiFetch(`/api/admin/courses/${id}`),
  create: (data) =>
    apiFetch("/api/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/api/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiFetch(`/api/admin/courses/${id}`, {
      method: "DELETE",
    }),
};

export const modulesAPI = {
  create: (courseId, data) =>
    apiFetch(`/api/admin/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/api/admin/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiFetch(`/api/admin/modules/${id}`, {
      method: "DELETE",
    }),
};

export const lessonsAPI = {
  create: (moduleId, data) =>
    apiFetch(`/api/admin/modules/${moduleId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/api/admin/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiFetch(`/api/admin/lessons/${id}`, {
      method: "DELETE",
    }),
};

export const adminUsersAPI = {
  getAll: (params) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page);
    const qs = searchParams.toString();
    return apiFetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },
  updateRole: (id, role) =>
    apiFetch(`/api/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  delete: (id) =>
    apiFetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    }),
};

export const adminProblemsAPI = {
  getAll: () => apiFetch("/api/admin/problems"),
  create: (data) =>
    apiFetch("/api/admin/problems", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/api/admin/problems/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiFetch(`/api/admin/problems/${id}`, {
      method: "DELETE",
    }),
};

export const adminContestsAPI = {
  getAll: () => apiFetch("/api/admin/contests"),
  create: (data) =>
    apiFetch("/api/admin/contests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/api/admin/contests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiFetch(`/api/admin/contests/${id}`, {
      method: "DELETE",
    }),
};


export const coursesAPI = {
  getAll: (params) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page);
    const qs = searchParams.toString();
    return apiFetch(`/api/courses${qs ? `?${qs}` : ""}`);
  },
  getBySlug: (slug) => apiFetch(`/api/courses/${slug}`),
  getEnrollmentStatus: (id) => apiFetch(`/api/courses/${id}/enrollment-status`),
  enroll: (id) =>
    apiFetch(`/api/courses/${id}/enroll`, {
      method: "POST",
    }),
};

export const problemsAPI = {
  getAll: (params) => {
    const searchParams = new URLSearchParams();
    if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.page) searchParams.set("page", params.page);
    const qs = searchParams.toString();
    return apiFetch(`/api/problems${qs ? `?${qs}` : ""}`);
  },
  getBySlug: (slug) => apiFetch(`/api/problems/${slug}`),
  submit: (slug, data) =>
    apiFetch(`/api/problems/${slug}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const checkoutAPI = {
  createSession: (data) =>
    apiFetch("/api/checkout/session", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const contestsAPI = {
  getAll: () => apiFetch("/api/contests"),
  getBySlug: (slug) => apiFetch(`/api/contests/${slug}`),
  register: (contestId) =>
    apiFetch(`/api/contests/${contestId}/register`, {
      method: "POST",
    }),
};

export const leaderboardAPI = {
  getTop: (page = 1, limit = 50) =>
    apiFetch(`/api/leaderboard?page=${page}&limit=${limit}`),
};

export const contactAPI = {
  submit: (data) =>
    apiFetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const adminContactAPI = {
  getAll: () => apiFetch("/api/contact"),
  toggleResponded: (id) =>
    apiFetch(`/api/contact/${id}/respond`, {
      method: "PATCH",
    }),
  delete: (id) =>
    apiFetch(`/api/contact/${id}`, {
      method: "DELETE",
    }),
};
