"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import { UsuarioDepartamentoDTO } from "@/app/api/generated/model";
import { useRouter } from "next/navigation";

interface DepartamentoContextType {
  availableDepartamentos: UsuarioDepartamentoDTO[];
  activeDepartamento: UsuarioDepartamentoDTO | null;
  setActiveDepartamento: (nombre: string) => void;
}

const DepartamentoContext = createContext<DepartamentoContextType | null>(null);

export function DepartamentoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeDeptId, setActiveDeptId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("activeDept");
  });
  const router = useRouter();

  useEffect(() => {
      const saved = localStorage.getItem("activeDept");
      if (saved) {
        setActiveDeptId(saved);
      }
  }, []);

  const availableDepartamentos = useMemo(
    () => user?.departamentos ?? [],
    [user]
  );

  const activeDepartamento = useMemo(
    () => availableDepartamentos.find(d => d.departamentoNombre === activeDeptId)
      ?? availableDepartamentos[0]
      ?? null,
    [availableDepartamentos, activeDeptId]
  );

  const handleSetActiveDept = (dept: string) => {
    setActiveDeptId(dept);
    localStorage.setItem("activeDept", dept);
    router.push(`/`);
  };

  return (
    <DepartamentoContext.Provider
      value={{
        availableDepartamentos,
        activeDepartamento,
        setActiveDepartamento: handleSetActiveDept,
      }}
    >
      {children}
    </DepartamentoContext.Provider>
  );
}

export const useDept = () => {
  const ctx = useContext(DepartamentoContext);
  if (!ctx) throw new Error("useDept must be used inside DepartamentoProvider");
  return ctx;
};

