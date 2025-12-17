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
    // Si el usuario se carga con éxito o si cambia:
    if (
      user &&
      Array.isArray(user.departamentos) &&
      user.departamentos.length > 0 &&
      Array.isArray(user.departamentos[0].roles) &&
      user.departamentos[0].roles.length > 0
    ) {
      const departamento = user.departamentos[0];

      // A. Definir roles disponibles (basado en la lógica ADMIN)
      const roles: UsuarioDepartamentoDTORolesItem[] = user.isAdmin
        ? ["ADMINISTRACION", "DOCENTE", "COORDINACION_COMISION_CURRICULAR", "SECRETARIA", "DIRECCION_ADMINISTRATIVA"]
        : departamento.roles as UsuarioDepartamentoDTORolesItem[];
          
      setAvailableRoles(roles);

      // B. Intentar recuperar de localStorage
      const savedRole = localStorage.getItem("activeRole");
      
      // C. Establecer el rol activo (prioridad: guardado > primero de la lista)
      if (savedRole && roles.includes(savedRole as unknown as UsuarioDepartamentoDTORolesItem)) {
        setActiveRole(savedRole as unknown as UsuarioDepartamentoDTORolesItem);
      } else {
        // Establecer el primer rol si no hay uno guardado o el guardado no es válido
        setActiveRole(roles[0] || null);
      }
    } else if (!user && !isLoading) {
      // 3. Manejar el caso de NO autenticado (limpiar roles)
      setActiveRole(null);
      setAvailableRoles([]);
    }
  }, [user, isLoading]);

  const updateRole = (role: UsuarioDepartamentoDTORolesItem) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", String(role));
  };

  // if (isLoading) {
  //     return <div>Cargando usuario...</div>;
  // }
  
  // if (!activeRole) {
  //     // Opcional: devolver null o un spinner si el usuario está autenticado pero el rol no está listo
  //     return null; 
  // }

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
