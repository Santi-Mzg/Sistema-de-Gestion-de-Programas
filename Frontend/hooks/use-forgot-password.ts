"use client";

import { ForgotPasswordRequest } from "@/app/api/generated/model";
import { useState } from "react";

export function useForgotPasswordFlow() {

  const [success, setSuccess] = useState(false);

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    const res = await fetch("/api/auth/forgot-password", {
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
    forgotPassword,
    success,
    setSuccess
  };
}
