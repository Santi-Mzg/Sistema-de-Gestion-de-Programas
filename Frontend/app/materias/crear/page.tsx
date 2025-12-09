"use client"

import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos, useListDepartamentos } from "@/app/api/generated/syllabusApi";
import { MateriaForm } from "@/components/forms/materia-form";


export default function CrearMateria() {

    const departamentosDisponibles: DepartamentoResponseDTO[] = useListDepartamentos().data || [];
  
    return (
      <MateriaForm departamentos={departamentosDisponibles} />
    );
}
