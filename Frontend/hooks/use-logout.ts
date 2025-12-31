"use client";

import { useRouter } from "next/navigation";
import { getMeQueryKey, useLogout } from "@/app/api/generated/client";
import { useQueryClient } from "@tanstack/react-query";

export function useLogoutFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const logout = async () => {
    try {
        await fetch("/api/auth/logout", {
            method: "POST",
        });
    } finally {
        queryClient.removeQueries({
            queryKey: getMeQueryKey()
        });
        
        router.replace("/login");
    }
  };

  return {
    logout,
    isLoading: logoutMutation.isPending,
  };
}
