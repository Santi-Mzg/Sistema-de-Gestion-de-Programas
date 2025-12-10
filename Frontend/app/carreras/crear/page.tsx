import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos } from "@/app/api/generated/server";
import { CarreraForm } from "@/components/forms/carrera-form";

export default async function CrearCarrera() {
  
  const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;

    return (
      <CarreraForm departamentos={departamentosDisponibles} />
    );
}
