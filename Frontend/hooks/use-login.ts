"use client";

import { useRouter } from "next/navigation";
import { LoginRequest } from "@/app/api/generated/model";
import { getMeQueryKey, useLogin, useMe } from "@/app/api/generated/client";
import { useQueryClient } from "@tanstack/react-query";

export function useLoginFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useLogin();

  const login = async (data: LoginRequest) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Login inválido");
    }
    
    await queryClient.resetQueries({
      queryKey: getMeQueryKey(),
      exact: true,
    });

    router.replace("/");
  };

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}
