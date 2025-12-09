"use client"

import { CarreraResponseDTO, DepartamentoResponseDTO, ProgramaCargaAdministrativoDTO, UserResponseDTO } from "@/app/api/generated/model";
import { listCarreras, listDepartamentos, useListCarreras, useListDepartamentos } from "@/app/api/generated/syllabusApi";
import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";


export default function CrearPrograma() {

  const departamentosDisponibles: DepartamentoResponseDTO[] = useListDepartamentos().data || [];
  const carrerasDisponibles: CarreraResponseDTO[] = useListCarreras().data || [];

    return (
      <SyllabusAdministrativoForm departamentosDisponibles={departamentosDisponibles} carrerasDisponibles={carrerasDisponibles} />
    );
}
