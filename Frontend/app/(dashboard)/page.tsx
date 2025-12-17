"use client"

import { AdministracionDashboard } from "@/components/dashboards/administracion-dashboard"
import { ProfesorDashboard } from "@/components/dashboards/profesor-dashboard"
import { CoordinadorDashboard } from "@/components/dashboards/coordinador-dashboard"
import { SecretarioDashboard } from "@/components/dashboards/secretario-dashboard"
import { useRole } from "@/context/role-context"
import { ProgramaResponseDTO } from "../api/generated/model"
import { useListProgramas } from "../api/generated/client"


export default function Dashboard() {
  const { activeRole } = useRole();
  // const programas: ProgramaResponseDTO[] = (await listProgramas()).data;
  const programas: ProgramaResponseDTO[] = useListProgramas().data || [];


  switch (activeRole) {
    case "DOCENTE":
      return <ProfesorDashboard programas={programas} />;

    case "SECRETARIA":
      return <SecretarioDashboard programas={programas} />;

    case "COORDINACION_COMISION_CURRICULAR":
      return <CoordinadorDashboard programas={programas} />;

    case "ADMINISTRACION":
      return <AdministracionDashboard programas={programas} />;
    default:
      return <div className="p-8 max-w-7xl mx-auto">Seleccione un rol para ver el panel correspondiente.</div>;
  }
}
