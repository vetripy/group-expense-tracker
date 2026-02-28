"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearTokens, hasToken, setTokens } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{
        access_token: string;
        refresh_token: string;
        user: User;
      }>("/auth/login", { email, password });
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      await api.post("/auth/register", { email, password, full_name: fullName });
      const { data } = await api.post<{
        access_token: string;
        refresh_token: string;
        user: User;
      }>("/auth/login", { email, password });
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
