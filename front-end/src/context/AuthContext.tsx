// src/context/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from "react";
import * as api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: Omit<User, "token">, token: string) => void;
  logout: () => void;
  loading: boolean;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = (userData: Omit<User, "token">, token: string) => {
    const userWithToken: User = { ...userData, token };
    localStorage.setItem("user", JSON.stringify(userWithToken));
    setUser(userWithToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Send forgot password request
  const forgotPassword = async (email: string) => {
    try {
      await api.forgotPassword({ email });
      console.log("Reset link sent to email");
    } catch (error: any) {
      console.error("Forgot password failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // Reset password using token
  const resetPassword = async (token: string, password: string) => {
    try {
      await api.resetPassword({ token, password });
      console.log("Password reset successful");
    } catch (error: any) {
      console.error("Reset password failed:", error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, forgotPassword, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
