"use client"

import { useListDepartamentos } from "@/app/api/generated/client";
import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos } from "@/app/api/generated/server";
import { MateriaForm } from "@/components/forms/materia-form";


export default function CrearMateria() {

    // const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
    const departamentosDisponibles: DepartamentoResponseDTO[] = useListDepartamentos().data || [];
  
    return (
      <MateriaForm departamentos={departamentosDisponibles} />
    );
}
