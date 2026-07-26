import axios, { type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Token refresh state ──────────────────────────────────────────────────────
let isRefreshing = false;
let refreshFailed = false;
let pendingQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: unknown | null) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(api(config));
    }
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Network error — no response received
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest.url || "";

    // Never intercept auth endpoints themselves
    if (
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    // Only handle 401 (unauthorized)
    if (status !== 401) {
      return Promise.reject(error);
    }

    // If refresh already failed this session, don't retry — just reject.
    // React Router's ProtectedRoute will redirect to /login.
    if (refreshFailed) {
      return Promise.reject(error);
    }

    // If already marked as retried, reject to avoid infinite retry
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // ─── Attempt token refresh ──────────────────────────────────────────────
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use raw axios (not `api`) to avoid interceptor recursion
      const refreshBase = import.meta.env.VITE_API_URL || "/api";
      await axios.post(`${refreshBase}/auth/refresh`, {}, { withCredentials: true });

      isRefreshing = false;
      processQueue(null);

      // Retry the original request with new cookies
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshFailed = true;
      processQueue(refreshError);

      // Do NOT use window.location.href — that causes a full page reload
      // which re-mounts the app and restarts the loop.
      // Instead, just reject. The AuthContext will set user=null,
      // and ProtectedRoute will render <Navigate to="/login"> via React Router.
      return Promise.reject(refreshError);
    }
  }
);

/**
 * Call this after a successful login/register to reset the refresh-failed flag.
 */
export function resetAuthState() {
  refreshFailed = false;
  isRefreshing = false;
  pendingQueue = [];
}

export default api;