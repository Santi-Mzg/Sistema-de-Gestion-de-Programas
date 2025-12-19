"use client"

import { useListDepartamentos } from "@/app/api/generated/client";
import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { AreaForm } from "@/components/forms/area-form";


export default function CrearArea() {

    // const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
    const departamentosDisponibles: DepartamentoResponseDTO[] = useListDepartamentos().data || [];

    return (
      <AreaForm departamentos={departamentosDisponibles} />
    );
}
