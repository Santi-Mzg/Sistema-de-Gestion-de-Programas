"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export function useLogoutFlow() {
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
        await fetch("/api/auth/logout", {
            method: "POST",
        });
    } finally {
        queryClient.clear();
        
        window.location.href = "/login";
    }
  };

  return {
    logout,
    isLoading: false,
  };
}
