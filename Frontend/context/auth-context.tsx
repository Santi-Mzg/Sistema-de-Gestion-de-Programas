"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { LoginRequest, UserResponseDTO } from "@/app/api/generated/model";
import { useLogin, useLogout, useMe } from "@/app/api/generated/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserResponseDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserResponseDTO | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
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
    
    document.cookie = `jwtNext=${user.token}; path=/; max-age=86400; Secure; SameSite=Lax`;
    
    if (user) setUser(user);
  };

  // 🔓 LOGOUT
  const logout = async () => {
try {
    await logoutMutation.mutateAsync();
  } catch (error) {
    console.error("Error calling backend logout", error);
  } finally {
    document.cookie = "jwtNext=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure";

    setUser(null);
    
    window.location.href = "/login";
  }
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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
