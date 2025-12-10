"use client"

import { CarreraResponseDTO, DepartamentoResponseDTO, ProgramaCargaAdministrativoDTO, UserResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos, listCarreras, listProfesores } from "@/app/api/generated/server";
import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";


export default async function CrearPrograma() {

  const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
  const carrerasDisponibles: CarreraResponseDTO[] = (await listCarreras()).data;
  const profesoresDisponibles: UserResponseDTO[] = (await listProfesores()).data;

    return (
      <SyllabusAdministrativoForm departamentosDisponibles={departamentosDisponibles} carrerasDisponibles={carrerasDisponibles} profesoresDisponibles={profesoresDisponibles} />
    );
}
