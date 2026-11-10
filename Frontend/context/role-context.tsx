"use client";

import { createContext, useContext, useLayoutEffect, useMemo } from "react";
import { useDept } from "./dept-context";
import { Rol } from "@/app/api/generated/model";
import { useRouter } from "next/navigation";
import { useStoredPreference } from "@/hooks/use-stored-preference";

interface RoleContextType {
  availableRoles: Rol[];
  activeRole: Rol | null;
  setActiveRole: (r: Rol) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { activeDepartamento } = useDept();
  const router = useRouter();
  const [storedRole, setStoredRole] = useStoredPreference("activeRole");

  const availableRoles = useMemo(
    () => activeDepartamento?.roles ?? [],
    [activeDepartamento]
  );

  // La preferencia solo se usa si pertenece al departamento activo.
  const activeRole = availableRoles.includes(storedRole as Rol)
    ? storedRole as Rol
    : availableRoles[0] ?? null;

  // Los efectos de las consultas deben leer el mismo rol que muestra el contexto.
  useLayoutEffect(() => {
    if (storedRole !== undefined && activeRole) setStoredRole(activeRole);
  }, [storedRole, activeRole, setStoredRole]);


  const handleSetActiveRole = (rol: Rol) => {
    setStoredRole(rol);
    router.push('/');
  };

  return (
    <RoleContext.Provider
      value={{
        availableRoles,
        activeRole,
        setActiveRole: handleSetActiveRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
};
