import { CarreraResponseDTO, DepartamentoResponseDTO, UserResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos, listCarreras, listProfesores } from "@/app/api/generated/server";
import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";


export default async function CrearPrograma() {

  const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
  const carrerasDisponibles: CarreraResponseDTO[] = (await listCarreras()).data;
  const profesoresDisponibles: UserResponseDTO[] = (await listProfesores()).data;

  console.log("DEPARTAMENTOS RAW:", departamentosDisponibles);
  console.log("CARRERAS RAW:", carrerasDisponibles);
  console.log("PROFESORES RAW:", profesoresDisponibles);
  
    return (
      <SyllabusAdministrativoForm departamentosDisponibles={departamentosDisponibles} carrerasDisponibles={carrerasDisponibles} profesoresDisponibles={profesoresDisponibles} />
    );
}
