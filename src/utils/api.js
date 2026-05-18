import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizedApiUrl = rawApiUrl
  ? `${rawApiUrl.replace(/\/$/, "").replace(/\/api$/i, "")}/api`
  : "/api";
const api = axios.create({
  baseURL: normalizedApiUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ds_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect handled in AuthContext
    }
    return Promise.reject(new Error(message));
  },
);

export default api;
