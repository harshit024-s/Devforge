const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `API error: ${res.status}`);
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
  getEnrollmentStatus: (id, userId) => apiFetch(`/api/courses/${id}/enrollment-status?userId=${userId}`),
  enroll: (id, userId) =>
    apiFetch(`/api/courses/${id}/enroll`, {
      method: "POST",
      body: JSON.stringify({ userId }),
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
  getBySlug: (slug, userId) => 
    apiFetch(`/api/contests/${slug}${userId ? `?userId=${userId}` : ""}`),
  register: (contestId, userId) =>
    apiFetch(`/api/contests/${contestId}/register`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
};

export const leaderboardAPI = {
  getTop: (page = 1, limit = 50) =>
    apiFetch(`/api/leaderboard?page=${page}&limit=${limit}`),
};
