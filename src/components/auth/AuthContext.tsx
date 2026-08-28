import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setAuthTokens, clearAuthTokens, getAuthToken } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  display_name?: string;
  role: "READER" | "WRITER" | "ADMIN";
  avatar_url?: string;
  bio?: string;
  is_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  role: "reader" | "writer" | "admin";
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<any>;
  googleLogin: (idToken: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<any>;
  resendRegistrationOtp: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("tossatale_user_data");
      return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const role: "reader" | "writer" | "admin" = user
    ? (user.role.toLowerCase() as any)
    : (typeof window !== "undefined" ? (localStorage.getItem("tossatale_user_role") as any) : null) || "reader";

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get<User>("/auth/me/");
      if (res.success && res.data) {
        setUser(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("tossatale_user_data", JSON.stringify(res.data));
          localStorage.setItem("tossatale_user_role", res.data.role.toLowerCase());
        }
      }
    } catch (err) {
      console.error("Failed to fetch user me:", err);
      setUser(null);
      clearAuthTokens();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.post("/auth/login/", credentials);
    if (res.success && res.data) {
      const { access, refresh, user: userData } = res.data;
      if (access && refresh) {
        setAuthTokens(access, refresh);
      }
      let currentUser = userData;
      if (!currentUser) {
        try {
          const meRes = await api.get<User>("/auth/me/");
          if (meRes.success && meRes.data) {
            currentUser = meRes.data;
          }
        } catch {
          // If /auth/me/ fails, currentUser remains null
        }
      }
      if (currentUser) {
        setUser(currentUser);
        res.data.user = currentUser;
        if (typeof window !== "undefined") {
          localStorage.setItem("tossatale_user_data", JSON.stringify(currentUser));
          localStorage.setItem("tossatale_user_role", currentUser.role.toLowerCase());
        }
      }
    }
    return res;
  };

  const googleLogin = async (idToken: string) => {
    const res = await api.post("/auth/google/", { id_token: idToken });
    if (res.success && res.data) {
      const { access, refresh, user: userData } = res.data;
      setAuthTokens(access, refresh);
      let currentUser = userData;
      if (!currentUser) {
        try {
          const meRes = await api.get<User>("/auth/me/");
          if (meRes.success && meRes.data) {
            currentUser = meRes.data;
          }
        } catch {
          // Ignore
        }
      }
      if (currentUser) {
        setUser(currentUser);
        res.data.user = currentUser;
        if (typeof window !== "undefined") {
          localStorage.setItem("tossatale_user_data", JSON.stringify(currentUser));
          localStorage.setItem("tossatale_user_role", currentUser.role.toLowerCase());
        }
      }
    }
    return res;
  };

  const register = async (data: any) => {
    const res = await api.post("/auth/register/", data);
    if (res.success && res.data) {
      const { access, refresh, user: userData, requires_otp } = res.data;
      if (!requires_otp && access && refresh) {
        setAuthTokens(access, refresh);
        if (userData) {
          setUser(userData);
          if (typeof window !== "undefined") {
            localStorage.setItem("tossatale_user_data", JSON.stringify(userData));
            localStorage.setItem("tossatale_user_role", userData.role.toLowerCase());
          }
        }
      }
    }
    return res;
  };

  const verifyRegistrationOtp = async (email: string, otp: string) => {
    const res = await api.post("/auth/register/verify-otp/", { email, otp });
    if (res.success && res.data) {
      const { access, refresh, user: userData } = res.data;
      if (access && refresh) {
        setAuthTokens(access, refresh);
      }
      if (userData) {
        setUser(userData);
        if (typeof window !== "undefined") {
          localStorage.setItem("tossatale_user_data", JSON.stringify(userData));
          localStorage.setItem("tossatale_user_role", userData.role.toLowerCase());
        }
      }
    }
    return res;
  };

  const resendRegistrationOtp = async (email: string) => {
    return await api.post("/auth/register/resend-otp/", { email });
  };

  const logout = async () => {
    try {
      const refresh = typeof window !== "undefined" ? localStorage.getItem("tossatale_refresh_token") : null;
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch {
      // Ignore logout API error
    } finally {
      setUser(null);
      clearAuthTokens();
      if (typeof window !== "undefined") {
        localStorage.removeItem("tossatale_user_data");
        localStorage.setItem("tossatale_user_role", "guest");
        window.dispatchEvent(new Event("storage"));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        googleLogin,
        register,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
