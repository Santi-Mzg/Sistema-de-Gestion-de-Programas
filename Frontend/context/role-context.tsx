"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useDept } from "./dept-context";
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";

interface RoleContextType {
  availableRoles: UsuarioDepartamentoDTORolesItem[];
  activeRole: UsuarioDepartamentoDTORolesItem | null;
  setActiveRole: (r: UsuarioDepartamentoDTORolesItem) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { activeDepartamento } = useDept();
  const [activeRole, setActiveRole] = useState<UsuarioDepartamentoDTORolesItem | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("activeRole") as UsuarioDepartamentoDTORolesItem | null;
  });    

  const availableRoles = useMemo(
    () => activeDepartamento?.roles ?? [],
    [activeDepartamento]
  );

  useEffect(() => {
    const savedRole = localStorage.getItem("activeRole") as UsuarioDepartamentoDTORolesItem | null;
    
    // Validamos que el rol guardado exista dentro de los roles del departamento actual
    if (savedRole && availableRoles.includes(savedRole)) {
      setActiveRole(savedRole);
    } else if (availableRoles.length > 0) {
      setActiveRole(availableRoles[0]);
    } else {
      setActiveRole(null);
    }
  }, [availableRoles]); // Se dispara cuando cambia el depto (y por ende sus roles)


  const handleSetActiveRole = (rol: UsuarioDepartamentoDTORolesItem) => {
    setActiveRole(rol);
    localStorage.setItem("activeRole", String(rol));
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
