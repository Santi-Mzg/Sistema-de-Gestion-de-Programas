"use client";

import type { ResetPasswordRequest } from "@/app/api/generated/model/resetPasswordRequest";
import { useState } from "react";

export function useSetPasswordFlow() {

  const [success, setSuccess] = useState(false);

  const setPassword = async (data: ResetPasswordRequest) => {
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al procesar la solicitud");
    }

    setSuccess(true);
  };

  return {
    setPassword,
    success,
    setSuccess
  };
}
