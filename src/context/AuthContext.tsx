import { createContext, useContext, useState } from "react";

import type { ReactNode } from "react";

export interface AuthPayload {
  accessToken: string;
  accessTokenExpiresUtc: string;
  refreshToken: string;
  role: string;
  username: string;
  mustChangePassword: boolean;
}

interface AuthContextType {
  auth: AuthPayload | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthPayload | null>>;
  login: (data: AuthPayload) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthPayload | null>(() => {
    const stored = localStorage.getItem("auth");

    return stored ? JSON.parse(stored) : null;
  });

  const login = (data: AuthPayload) => {
    setAuth(data);
    localStorage.setItem("auth", JSON.stringify(data));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
