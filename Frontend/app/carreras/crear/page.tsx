"use client"

import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos, useListDepartamentos } from "@/app/api/generated/syllabusApi";
import { CarreraForm } from "@/components/forms/carrera-form";

export default function CrearCarrera() {
  
  const departamentosDisponibles: DepartamentoResponseDTO[] = useListDepartamentos().data || [];

    return (
      <CarreraForm departamentos={departamentosDisponibles} />
    );
}
