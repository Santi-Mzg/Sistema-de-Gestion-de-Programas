
import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { listDepartamentos } from "@/app/api/generated/server";
import { AreaForm } from "@/components/forms/area-form";


export default async function CrearArea() {

    const departamentosDisponibles: DepartamentoResponseDTO[] = (await listDepartamentos()).data;
  
    return (
      <AreaForm departamentos={departamentosDisponibles} />
    );
}
