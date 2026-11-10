"use client";

import { createContext, useContext, useMemo, useLayoutEffect } from "react";
import { useAuth } from "./auth-context";
import { UsuarioDepartamentoDTO } from "@/app/api/generated/model";
import { useRouter } from "next/navigation";
import { useStoredPreference } from "@/hooks/use-stored-preference";

interface DepartamentoContextType {
  availableDepartamentos: UsuarioDepartamentoDTO[];
  activeDepartamento: UsuarioDepartamentoDTO | null;
  setActiveDepartamento: (nombre: string) => void;
}

const DepartamentoContext = createContext<DepartamentoContextType | null>(null);

export function DepartamentoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeDeptId, setActiveDeptId] = useStoredPreference("activeDept");
  const router = useRouter();


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

  useLayoutEffect(() => {
    if (activeDepartamento?.departamentoId) localStorage.setItem("activeDeptId", String(activeDepartamento.departamentoId));
  }, [activeDepartamento?.departamentoId]);

  const handleSetActiveDept = (dept: string) => {
    setActiveDeptId(dept);
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

