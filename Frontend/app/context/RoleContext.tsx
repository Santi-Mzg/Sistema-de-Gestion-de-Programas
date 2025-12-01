"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { UserResponseDTORolesItem } from "../api/generated/model";


interface RoleContextType {
  availableRoles: UserResponseDTORolesItem[];
  activeRole: UserResponseDTORolesItem;
  setActiveRole: (role: UserResponseDTORolesItem) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({
  children,
  userRoles, // viene desde el backend (session, endpoint, etc)
}: {
  children: React.ReactNode;
  userRoles: UserResponseDTORolesItem[];
}) {
  const [activeRole, setActiveRole] = useState<UserResponseDTORolesItem>(userRoles[0]);

  // Persistencia opcional
  useEffect(() => {
    const saved = localStorage.getItem("activeRole");
    if (saved && userRoles.includes(saved as UserResponseDTORolesItem)) {
      setActiveRole(saved as UserResponseDTORolesItem);
    }
  }, []);

  const updateRole = (role: UserResponseDTORolesItem) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role);
  };

  return (
    <RoleContext.Provider
      value={{
        availableRoles: userRoles,
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
