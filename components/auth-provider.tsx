"use client";

import { useAuth } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchSessionUser, type SessionUser } from "@/lib/data/auth";

const AuthContext = createContext<{ user: SessionUser | null; refresh: () => Promise<void> }>({ user: null, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [user, setUser] = useState<SessionUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSessionUser();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setUser(null);
      return;
    }
    void refresh();
  }, [isLoaded, isSignedIn, refresh]);

  useEffect(() => {
    const handleChange = () => { void refresh(); };
    window.addEventListener("nf-auth-session-changed", handleChange);
    return () => window.removeEventListener("nf-auth-session-changed", handleChange);
  }, [refresh]);

  return <AuthContext.Provider value={{ user, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuthUser() {
  return useContext(AuthContext);
}
