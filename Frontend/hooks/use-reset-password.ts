"use client";

import { ResetPasswordRequest } from "@/app/api/generated/model";
import { useState } from "react";

export function useResetPasswordFlow() {

  const [success, setSuccess] = useState(false);

  const resetPassword = async (data: ResetPasswordRequest) => {
    const res = await fetch("/api/auth/reset-password", {
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
    resetPassword,
    success,
    setSuccess
  };
}
