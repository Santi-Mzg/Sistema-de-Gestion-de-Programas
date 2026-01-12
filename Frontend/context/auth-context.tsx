"use client";

import { createContext, useContext, useEffect } from "react";
import { UserResponseDTO } from "@/app/api/generated/model";
import { getMeQueryKey, useMe } from "@/app/api/generated/client";

interface AuthContextType {
  user: UserResponseDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const meQuery = useMe({
    query: {
      staleTime: 1000 * 60 * 5,
      retry: false,
      queryKey: getMeQueryKey()
    },
  });

  const value = {
    user: meQuery.data ?? null,
    isAuthenticated: !!meQuery.data,
    isLoading: meQuery.isLoading,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
