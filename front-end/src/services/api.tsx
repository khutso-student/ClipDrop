// src/api/api.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // cookies if any
});

// ✅ Attach token from localStorage.user.token
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("user");
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;

// ============================
// Auth APIs
// ============================
export const signup = async (data: { name: string; email: string; password: string }) => {
  const res = await api.post("/users/signup", data);
  return res.data;
};

export const login = async (data: { email: string; password: string }) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const res = await api.post("/users/forgot-password", data);
  return res.data;
};

export const resetPassword = async (data: { token: string; password: string }) => {
  const res = await api.post("/users/reset-password", data);
  return res.data;
};
