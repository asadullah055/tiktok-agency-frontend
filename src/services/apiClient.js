import axios from "axios";

const DEFAULT_PROD_API_BASE = "https://tiktok-agnecy-back.vercel.app/api";

const resolveApiBaseUrl = () => {
  const envBase = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBase) return envBase.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const host = String(window.location.hostname || "").toLowerCase();
    const isLocalDev = host === "localhost" || host === "127.0.0.1";
    if (isLocalDev) return "/api";
  }

  return DEFAULT_PROD_API_BASE;
};

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || error)
);

export default apiClient;
