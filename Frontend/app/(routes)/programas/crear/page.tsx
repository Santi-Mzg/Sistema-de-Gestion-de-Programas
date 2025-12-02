import { CarreraResponseDTO, DepartamentoResponseDTO, ProgramaCargaAdministrativoDTO, UserResponseDTO } from "@/app/api/generated/model";
import { listCarreras, listDepartamentos } from "@/app/api/generated/syllabusApi";
import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";


export default async function CrearPrograma() {

  const departamentosDisponibles: DepartamentoResponseDTO[] = await listDepartamentos();
  const carrerasDisponibles: CarreraResponseDTO[] = await listCarreras();

    return (
      <SyllabusAdministrativoForm departamentosDisponibles={departamentosDisponibles} carrerasDisponibles={carrerasDisponibles} />
    );
}
