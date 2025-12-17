"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { LoginRequest, UserResponseDTO } from "@/app/api/generated/model";
import { useLogin, useLogout, useMe } from "@/app/api/generated/client";

interface AuthContextType {
  user: UserResponseDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserResponseDTO | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const authMeQuery = useMe();

  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Cargar usuario al iniciar
  useEffect(() => {
    if (authMeQuery.isSuccess && authMeQuery.data) {
      setUser(authMeQuery.data);
    }
    if (authMeQuery.isError) {
      setUser(null);
    }
    setIsLoading(authMeQuery.isLoading);
  }, [authMeQuery.isLoading, authMeQuery.isSuccess]);

  // 🔐 LOGIN
  const login = async (data: LoginRequest) => {
    const user = await loginMutation.mutateAsync({ data });

    if (user) setUser(user);
  };

  // 🔓 LOGOUT
  const logout = async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
