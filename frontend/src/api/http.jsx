import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const http = axios.create({
  baseURL: API_BASE_URL,
    
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const lang =
    localStorage.getItem("i18nextLng") ||
    localStorage.getItem("lang") ||
    "ru";
  config.headers["Accept-Language"] = lang;
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (!isFormData) {
    if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  } else {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

let isRefreshing = false;
let queue = [];

function resolveQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refresh = tokenStorage.getRefresh();
    if (!refresh) return Promise.reject(error);

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(http(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const resp = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
      const newAccess = resp.data.access;
      tokenStorage.setTokens({ access: newAccess });

      resolveQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return http(original);
    } catch (err) {
      resolveQueue(err, null);
      tokenStorage.clear();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
