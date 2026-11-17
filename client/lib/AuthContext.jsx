"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("devforge_user");
    const savedToken = localStorage.getItem("devforge_token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("devforge_user");
        localStorage.removeItem("devforge_token");
      }
    } else {
      localStorage.removeItem("devforge_user");
      localStorage.removeItem("devforge_token");
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("devforge_user", JSON.stringify(userData));
    localStorage.setItem("devforge_token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("devforge_user");
    localStorage.removeItem("devforge_token");
  };

  const isAdmin = user?.role === "ADMIN";
  const isInstructor = user?.role === "INSTRUCTOR" || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isInstructor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
