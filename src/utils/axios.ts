import axios from "axios";
import { showAuthErrorToast } from "./toast";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true"
  },
  // withCredentials: true,
});

// Global handler for authenticated calls: any 401/403 surfaces a single
// "not authorized" message instead of each page's generic failure toast.
axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      showAuthErrorToast();
    }
    return Promise.reject(error);
  },
);