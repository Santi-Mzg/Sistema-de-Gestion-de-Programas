"use client"

import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos } from "@/app/api/generated/server";
import { MateriaForm } from "@/components/forms/materia-form";


export default async function CrearMateria() {

    const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
  
    return (
      <MateriaForm departamentos={departamentosDisponibles} />
    );
}
