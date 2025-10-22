// src/context/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from "react";
import * as api from "../services/api";

export interface User {
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

  // Restore user from localStorage and fetch real data from backend
useEffect(() => {
  const initializeUser = async () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        if (!parsedUser.token) throw new Error("No token found");

        // ✅ Just call getCurrentUser without arguments
        const verifiedUser = await api.getCurrentUser();

        setUser({ ...verifiedUser, token: parsedUser.token });
      } catch (error) {
        console.error("Failed to fetch user from token:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setLoading(false);
  };

  initializeUser();
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

  const forgotPassword = async (email: string) => {
    try {
      await api.forgotPassword({ email });
      console.log("Reset link sent to email");
    } catch (error: any) {
      console.error("Forgot password failed:", error.response?.data || error.message);
      throw error;
    }
  };

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
