"use client";

import { useListDepartamentos } from "@/app/api/generated/client";
import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { DepartamentosList } from "@/components/pages/departamentos-list"

export default function Departamentos() {

    const departamentos: DepartamentoResponseDTO[] = useListDepartamentos().data || [];
    
  
    return (
      <DepartamentosList departamentos={departamentos} />
    )
}
