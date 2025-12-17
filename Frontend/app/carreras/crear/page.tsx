"use client"

import { useListDepartamentos } from "@/app/api/generated/client";
import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { CarreraForm } from "@/components/forms/carrera-form";

export default function CrearCarrera() {

  // const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
  const departamentosDisponibles: DepartamentoResponseDTO[] = useListDepartamentos().data || [];

    return (
      <CarreraForm departamentos={departamentosDisponibles} />
    );
}
