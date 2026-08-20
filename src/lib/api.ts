/**
 * Tossatale — API Client
 * Configured fetch wrapper with JWT authentication and automatic token refresh.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  data: any;
  errors?: Record<string, string[]> | undefined;

  constructor(message: string, status: number, data?: any, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.data = data;
    if (errors !== undefined) {
      this.errors = errors;
    }
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tossatale_access_token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tossatale_refresh_token");
};

export const setAuthTokens = (access: string, refresh?: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("tossatale_access_token", access);
  if (refresh) {
    localStorage.setItem("tossatale_refresh_token", refresh);
  }
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tossatale_access_token");
  localStorage.removeItem("tossatale_refresh_token");
  localStorage.removeItem("tossatale_user_role");
  localStorage.removeItem("tossatale_user_data");
  const path = window.location.pathname;
  if (path.startsWith("/admin") || path.startsWith("/writer") || path.startsWith("/reader")) {
    window.location.href = "/auth";
  }
};

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // Automatic 401 / Token Expired Silent Refresh & Redirect
  if ((response.status === 401 || response.status === 403) && !endpoint.includes("/auth/")) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newAccess = refreshData.data?.access || refreshData.access;
            if (newAccess) {
              setAuthTokens(newAccess);
              processQueue(null, newAccess);
              headers.set("Authorization", `Bearer ${newAccess}`);
              response = await fetch(url, { ...config, headers });
            } else {
              clearAuthTokens();
              processQueue(new Error("Invalid refresh response"), null);
            }
          } else {
            clearAuthTokens();
            processQueue(new Error("Token refresh failed"), null);
          }
        } catch (err) {
          clearAuthTokens();
          processQueue(err, null);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          headers.set("Authorization", `Bearer ${getAuthToken()}`);
          return fetch(url, { ...config, headers }).then((res) => res.json());
        });
      }
    } else {
      clearAuthTokens();
    }
  }

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (responseData.error_code === "TOKEN_NOT_VALID" || responseData?.errors?.code === "token_not_valid") {
      clearAuthTokens();
    }
    const errorMsg = responseData.message || responseData.detail || responseData?.errors?.detail || "An unexpected error occurred";
    throw new ApiError(errorMsg, response.status, responseData.data, responseData.errors);
  }

  return responseData;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
