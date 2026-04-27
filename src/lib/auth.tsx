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
    const res = await api.post("/auth/login", { email, password });
    const data = res.data.data;
    const userData: User = {
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      token: data.token,
    };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post("/auth/register", data);
    const result = res.data.data;
    const userData: User = {
      email: result.email,
      fullName: result.fullName,
      role: result.role,
      token: result.token,
    };
    localStorage.setItem("token", result.token);
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

