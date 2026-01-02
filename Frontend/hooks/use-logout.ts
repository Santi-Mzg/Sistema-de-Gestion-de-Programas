"use client";

import { useRouter } from "next/navigation";
import { getMeQueryKey } from "@/app/api/generated/client";
import { useQueryClient } from "@tanstack/react-query";

export function useLogoutFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
    isLoading: false,
  };
}
