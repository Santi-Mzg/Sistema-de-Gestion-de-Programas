"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./auth-context";
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";


interface RoleContextType {
  availableRoles: UsuarioDepartamentoDTORolesItem[];
  activeRole: UsuarioDepartamentoDTORolesItem | null;
  setActiveRole: (role: UsuarioDepartamentoDTORolesItem) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useContext(AuthContext);
  console.log("Current user in layout:", user);


  const [activeRole, setActiveRole] = useState<UsuarioDepartamentoDTORolesItem | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UsuarioDepartamentoDTORolesItem[]>([]);
  
useEffect(() => {
    if (!user) {
        if (!isLoading) {
          setActiveRole(null);
          setAvailableRoles([]);
        }
        return;
      }
    let roles: UsuarioDepartamentoDTORolesItem[] = [];

    if (user.isAdmin) {
      roles = ["SYSTEM_ADMIN", "ADMINISTRACION", "DOCENTE", "COORDINACION_COMISION_CURRICULAR", "SECRETARIA", "DIRECCION_ADMINISTRATIVA"];
    } else if (user.departamentos && user.departamentos.length > 0) {
      roles = user.departamentos[0].roles as UsuarioDepartamentoDTORolesItem[];
    }

    setAvailableRoles(roles);

    if (roles.length > 0) {
      const savedRole = localStorage.getItem("activeRole");
      if (savedRole && roles.includes(savedRole as any)) {
        if (activeRole !== savedRole) setActiveRole(savedRole as any);
      } else {
        if (activeRole !== roles[0]) setActiveRole(roles[0]);
      }
    }
  }, [user, isLoading]);


  const updateRole = (role: UsuarioDepartamentoDTORolesItem) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", String(role));
  };

  return (
    <RoleContext.Provider
      value={{
        availableRoles,
        activeRole,
        setActiveRole: updateRole,
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
