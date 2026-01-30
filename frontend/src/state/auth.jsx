import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  async function refresh() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setReady(true);
        return;
      }
      const { data } = await api.get("/users/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => { refresh(); }, []);

  const value = useMemo(() => ({
    user,
    ready,
    async login(email, password) {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
    async signup(payload) {
      const { data } = await api.post("/auth/signup", payload);
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
    logout() {
      localStorage.removeItem("token");
      setUser(null);
    },
    async updateProfile(patch) {
      const { data } = await api.patch("/users/me", patch);
      setUser(data.user);
    },
  }), [user, ready]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
