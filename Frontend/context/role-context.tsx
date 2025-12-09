"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { UserResponseDTORolesItem } from "../app/api/generated/model";
import { AuthContext } from "./auth-context";


interface RoleContextType {
  availableRoles: UserResponseDTORolesItem[];
  activeRole: UserResponseDTORolesItem | null;
  setActiveRole: (role: UserResponseDTORolesItem) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useContext(AuthContext);
  console.log("Current user in layout:", user);


  const [activeRole, setActiveRole] = useState<UserResponseDTORolesItem | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserResponseDTORolesItem[]>([]);
  
useEffect(() => {
    // Si el usuario se carga con éxito o si cambia:
    if (user && user.roles && user.roles.length > 0) {
      
      // A. Definir roles disponibles (basado en la lógica ADMIN)
      const roles: UserResponseDTORolesItem[] = user.roles.includes("ADMIN") 
          ? ["ADMINISTRATIVO", "PROFESOR", "COORDINADOR", "SECRETARIO"] 
          : user.roles;
          
      setAvailableRoles(roles);

      // B. Intentar recuperar de localStorage
      const savedRole = localStorage.getItem("activeRole") as UserResponseDTORolesItem;
      
      // C. Establecer el rol activo (prioridad: guardado > primero de la lista)
      if (savedRole && roles.includes(savedRole)) {
        setActiveRole(savedRole);
      } else {
        // Establecer el primer rol si no hay uno guardado o el guardado no es válido
        setActiveRole(roles[0]);
      }
    } else if (!user && !isLoading) {
      // 3. Manejar el caso de NO autenticado (limpiar roles)
      setActiveRole(null);
      setAvailableRoles([]);
    }
  }, [user, isLoading]); 

  const updateRole = (role: UserResponseDTORolesItem) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role);
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
