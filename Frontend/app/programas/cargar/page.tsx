"use client"

import { useListCarreras, useListDepartamentos } from "@/app/api/generated/client";
import { CarreraResponseDTO, DepartamentoResponseDTO, UserResponseDTO } from "@/app/api/generated/model";
import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";


export default function CrearPrograma() {

  // const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
  const departamentosDisponibles: DepartamentoResponseDTO[] =  useListDepartamentos().data || [];


  // const carrerasDisponibles: CarreraResponseDTO[] = (await listCarreras()).data;
  const carrerasDisponibles: CarreraResponseDTO[] = useListCarreras().data || [];

  // const profesoresDisponibles: UserResponseDTO[] = (await listProfesores()).data;

  
    return (
      <SyllabusAdministrativoForm departamentosDisponibles={departamentosDisponibles} carrerasDisponibles={carrerasDisponibles} profesoresDisponibles={[]} />
    );
}
