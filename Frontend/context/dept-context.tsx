"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { DepartamentoResponseDTO, UsuarioDepartamentoDTO } from "../app/api/generated/model";
import { AuthContext } from "./auth-context";
import { useListDepartamentos } from "@/app/api/generated/client";


interface DepartamentoContextType {
  availableDepartamentos: UsuarioDepartamentoDTO[];
  activeDepartamento: UsuarioDepartamentoDTO | null;
  setActiveDepartamento: (dept: UsuarioDepartamentoDTO) => void;
}

const DepartamentoContext = createContext<DepartamentoContextType | null>(null);

export function DepartamentoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useContext(AuthContext);
  console.log("Current user in layout:", user);

  const allDepartamentos: DepartamentoResponseDTO[] = useListDepartamentos().data || [];

  const [activeDepartamento, setActiveDepartamento] = useState<UsuarioDepartamentoDTO | null>(null);
  const [availableDepartamentos, setAvailableDepartamentos] = useState<UsuarioDepartamentoDTO[]>([]);

useEffect(() => {
    if (user && user.departamentos && user.departamentos.length > 0) {

      const departamentos: UsuarioDepartamentoDTO[] = user.isAdmin
          ? allDepartamentos
          : user.departamentos;
          
      setAvailableDepartamentos(departamentos);

      const savedDepartamento = localStorage.getItem("activeDepartamento") as UsuarioDepartamentoDTO;
      
      if (savedDepartamento && departamentos.includes(savedDepartamento)) {
        setActiveDepartamento(savedDepartamento);
      } else {
        setActiveDepartamento(departamentos[0]);
      }
    } else if (!user && !isLoading) {
      setActiveDepartamento(null);
      setAvailableDepartamentos([]);
    }
  }, [user, isLoading]); 

  const updateDepartamento = (departamento: UsuarioDepartamentoDTO) => {
    setActiveDepartamento(departamento);
    localStorage.setItem("activeDepartamento", JSON.stringify(departamento));
  };

  // if (isLoading) {
  //     return <div>Cargando usuario...</div>;
  // }
  
  // if (!activeDepartamento) {
  //     // Opcional: devolver null o un spinner si el usuario está autenticado pero el departamento no está listo
  //     return null; 
  // }

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
