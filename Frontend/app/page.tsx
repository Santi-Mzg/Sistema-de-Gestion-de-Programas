"use client"

import { AdministracionDashboard } from "@/components/dashboards/administracion-dashboard"
import { ProfesorDashboard } from "@/components/dashboards/profesor-dashboard"
import { CoordinadorDashboard } from "@/components/dashboards/coordinador-dashboard"
import { SecretarioDashboard } from "@/components/dashboards/secretario-dashboard"
import { useRole } from "@/context/role-context"


export default function Dashboard() {
  const { activeRole } = useRole();
  console.log("Active Role in Dashboard:", activeRole);


  switch (activeRole) {
    case "PROFESOR":
      return <ProfesorDashboard />;

    case "SECRETARIO":
      return <SecretarioDashboard />;

    case "COORDINADOR":
      return <CoordinadorDashboard />;

    case "ADMINISTRATIVO":
      return <AdministracionDashboard />;
       
    case "DIRECTOR_ADMINISTRATIVO":
      // return <DirectorAdministrativoDashboard />;

    default:
      return <div className="p-8 max-w-7xl mx-auto">Seleccione un rol para ver el panel correspondiente.</div>;
  }
}
