"use client"

import { AdministracionDashboard } from "@/components/dashboards/administracion-dashboard"
import { ProfesorDashboard } from "@/components/dashboards/profesor-dashboard"
import { CoordinadorDashboard } from "@/components/dashboards/coordinador-dashboard"
import { SecretarioDashboard } from "@/components/dashboards/secretario-dashboard"
import { useRole } from "@/context/role-context"
import { listProgramas } from "../api/generated/server"
import { ProgramaResponseDTO } from "../api/generated/model"


export default async function Dashboard() {
  const { activeRole } = useRole();
  const programas: ProgramaResponseDTO[] = (await listProgramas()).data;


  switch (activeRole) {
    case "PROFESOR":
      return <ProfesorDashboard programas={programas} />;

    case "SECRETARIO":
      return <SecretarioDashboard programas={programas} />;

    case "COORDINADOR":
      return <CoordinadorDashboard programas={programas} />;

    case "ADMINISTRATIVO":
      return <AdministracionDashboard programas={programas} />;
    default:
      return <div className="p-8 max-w-7xl mx-auto">Seleccione un rol para ver el panel correspondiente.</div>;
  }
}
