// "use client";

// import { createContext, useContext, useState, useEffect, useMemo } from "react";
// import { UsuarioDepartamentoDTO } from "../app/api/generated/model";
// import { useAuth } from "./auth-context";
// import { useListDepartamentos } from "@/app/api/generated/client";


// interface DepartamentoContextType {
//   availableDepartamentos: UsuarioDepartamentoDTO[];
//   activeDepartamento: UsuarioDepartamentoDTO | null;
//   setActiveDepartamento: (dept: UsuarioDepartamentoDTO) => void;
//   isLoading: boolean;
// }

// const DepartamentoContext = createContext<DepartamentoContextType | null>(null);

// export function DepartamentoProvider({ children }: { children: React.ReactNode }) {
//   const { user, isLoading: isLoadingUser } = useAuth();
//   const [isLoading, setIsLoading] = useState(true);

//   console.log("Current user in layout:", user);

//   const [activeDepartamento, setActiveDepartamento] = useState<UsuarioDepartamentoDTO | null>(null);
//   const [availableDepartamentos, setAvailableDepartamentos] = useState<UsuarioDepartamentoDTO[]>([]);

//   useEffect(() => {
//     if (!user) {
//       if (!isLoadingUser) {
//         setActiveDepartamento(null);
//         setAvailableDepartamentos([]);
//       }
//       return;
//     }

//     const departamentos: UsuarioDepartamentoDTO[] = user.departamentos || [];
        
//     setAvailableDepartamentos(departamentos);

//     if (departamentos.length === 0) return;

//     const savedDepartamentoRaw = localStorage.getItem("activeDepartamento");
//     let targetDept = departamentos[0];
//     if (savedDepartamentoRaw) {
//       const savedDepartamento: UsuarioDepartamentoDTO = JSON.parse(savedDepartamentoRaw);

//       const found = departamentos.find(d => d.departamentoId === savedDepartamento.departamentoId);

//       if (found) {
//         setActiveDepartamento(found);
//         return;
//       }
//     }

//     if (activeDepartamento?.departamentoId !== targetDept.departamentoId) {
//       setActiveDepartamento(targetDept);
//     }

//   }, [user, isLoadingUser, activeDepartamento?.departamentoId]);


//   const updateDepartamento = (departamento: UsuarioDepartamentoDTO) => {
//     setActiveDepartamento(departamento);
//     localStorage.setItem("activeDepartamento", JSON.stringify(departamento));
//   };

//   return (
//     <DepartamentoContext.Provider
//       value={{
//         availableDepartamentos,
//         activeDepartamento,
//         setActiveDepartamento: updateDepartamento,
//         isLoading,
//       }}
//     >
//       {children}
//     </DepartamentoContext.Provider>
//   );
// }

// export const useDept = () => {
//   const ctx = useContext(DepartamentoContext);
//   if (!ctx) throw new Error("useDept must be used inside DepartamentoProvider");
//   return ctx;
// };


"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-context";
import { UsuarioDepartamentoDTO } from "@/app/api/generated/model";

interface DepartamentoContextType {
  availableDepartamentos: UsuarioDepartamentoDTO[];
  activeDepartamento: UsuarioDepartamentoDTO | null;
  setActiveDepartamento: (nombre: string) => void;
}

const DepartamentoContext = createContext<DepartamentoContextType | null>(null);

export function DepartamentoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);

  useEffect(() => {
      const saved = localStorage.getItem("activeDept");
      if (saved) {
        setActiveDeptId(saved);
      }
  }, []);
console.log("USER "+JSON.stringify(user))

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

