"use client";

import { useAuth } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: string;
};

const AuthContext = createContext<{ user: SessionUser | null; refresh: () => Promise<void> }>({ user: null, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [user, setUser] = useState<SessionUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
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
