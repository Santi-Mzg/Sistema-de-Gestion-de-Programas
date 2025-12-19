"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { DepartamentoResponseDTO, UsuarioDepartamentoDTO } from "../app/api/generated/model";
import { AuthContext } from "./auth-context";
import { useListDepartamentos } from "@/app/api/generated/client";


interface DepartamentoContextType {
  availableDepartamentos: UsuarioDepartamentoDTO[];
  activeDepartamento: UsuarioDepartamentoDTO | null;
  setActiveDepartamento: (dept: UsuarioDepartamentoDTO) => void;
}

const DepartamentoContext = createContext<DepartamentoContextType | null>(null);

export function DepartamentoProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useContext(AuthContext);
  const { data: allDepartamentos } = useListDepartamentos();

  console.log("Current user in layout:", user);


  const adminDepartamentos = useMemo(() => {
    return (allDepartamentos || []).map(dept => ({
      departamentoId: dept.id,
      departamentoNombre: dept.nombre,
    }));
  }, [allDepartamentos]);

  const [activeDepartamento, setActiveDepartamento] = useState<UsuarioDepartamentoDTO | null>(null);
  const [availableDepartamentos, setAvailableDepartamentos] = useState<UsuarioDepartamentoDTO[]>([]);

  useEffect(() => {
    if (!user) {
      if (!isLoading) {
        setActiveDepartamento(null);
        setAvailableDepartamentos([]);
      }
      return;
    }

    const departamentos: UsuarioDepartamentoDTO[] = user.isAdmin
        ? adminDepartamentos
        : user.departamentos ?? [];
        
    setAvailableDepartamentos(departamentos);

    setAvailableDepartamentos(prev => {
      if (prev.length === departamentos.length && prev[0]?.departamentoId === departamentos[0]?.departamentoId) return prev;
      return departamentos;
    });

    if (departamentos.length === 0) return;

    const savedDepartamentoRaw = localStorage.getItem("activeDepartamento");
    let targetDept = departamentos[0];
    if (savedDepartamentoRaw) {
      const savedDepartamento: UsuarioDepartamentoDTO = JSON.parse(savedDepartamentoRaw);

      const found = departamentos.find(d => d.departamentoId === savedDepartamento.departamentoId);

      if (found) {
        setActiveDepartamento(found);
        return;
      }
    }

    if (activeDepartamento?.departamentoId !== targetDept.departamentoId) {
      setActiveDepartamento(targetDept);
    }

  }, [user, isLoading, adminDepartamentos, activeDepartamento?.departamentoId]);


  const updateDepartamento = (departamento: UsuarioDepartamentoDTO) => {
    setActiveDepartamento(departamento);
    localStorage.setItem("activeDepartamento", JSON.stringify(departamento));
  };

  console.log("isAdminA:", user?.isAdmin);
  console.log("admin:", user);

  console.log("Admin departamentos:", adminDepartamentos);
  console.log("Available departamentos:", availableDepartamentos);
  console.log("Active departamento:", activeDepartamento);

  return (
    <DepartamentoContext.Provider
      value={{
        availableDepartamentos,
        activeDepartamento,
        setActiveDepartamento: updateDepartamento,
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
