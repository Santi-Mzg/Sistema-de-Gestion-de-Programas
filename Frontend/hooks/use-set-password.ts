"use client";

import { SetPasswordRequest } from "@/app/api/generated/model/setPasswordRequest";
import { useState } from "react";

export function useSetPasswordFlow() {

  const [success, setSuccess] = useState(false);

  const setPassword = async (data: SetPasswordRequest) => {
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
