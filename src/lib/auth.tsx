import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "./api";

export interface User {
  email: string;
  fullName: string;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: "CANDIDATE" | "RECRUITER" | "ADMIN";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isBackendUnavailable(error: any) {
  return !error?.response && (error?.code === "ERR_NETWORK" || error?.message === "Network Error");
}

function offlineUser(email: string, fullName?: string): User {
  const nameFromEmail = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Candidate";
  const resolvedName = fullName?.trim() || nameFromEmail.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    email,
    fullName: resolvedName,
    role: "CANDIDATE",
    token: `offline-${Date.now()}`,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    let userData: User;

    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data.data;
      userData = {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        token: data.token,
      };
    } catch (error) {
      if (!isBackendUnavailable(error)) throw error;
      userData = offlineUser(email);
    }

    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    let userData: User;

    try {
      const res = await api.post("/auth/register", data);
      const result = res.data.data;
      userData = {
        email: result.email,
        fullName: result.fullName,
        role: result.role,
        token: result.token,
      };
    } catch (error) {
      if (!isBackendUnavailable(error)) throw error;
      userData = offlineUser(data.email, data.fullName);
    }

    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

