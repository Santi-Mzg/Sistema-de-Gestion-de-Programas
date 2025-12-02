import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos } from "@/app/api/generated/syllabusApi";
import { CarreraForm } from "@/components/forms/carrera-form";

export default async function CrearCarrera() {
  
  const departamentosDisponibles: DepartamentoResponseDTO[] = await listDepartamentos();

    return (
      <CarreraForm departamentos={departamentosDisponibles} />
    );
}
