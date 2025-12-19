"use client"

import { AdministracionDashboard } from "@/components/dashboards/administracion-dashboard"
import { ProfesorDashboard } from "@/components/dashboards/profesor-dashboard"
import { CoordinadorDashboard } from "@/components/dashboards/coordinador-dashboard"
import { SecretarioDashboard } from "@/components/dashboards/secretario-dashboard"
import { useRole } from "@/context/role-context"
import { UsuarioDepartamentoDTORolesItem } from "../api/generated/model"


export default function Dashboard() {
  const { activeRole } = useRole();


  switch (activeRole) {
    case UsuarioDepartamentoDTORolesItem.DOCENTE:
      return <ProfesorDashboard />;

    case UsuarioDepartamentoDTORolesItem.SECRETARIA:
      return <SecretarioDashboard />;

    case UsuarioDepartamentoDTORolesItem.COORDINACION_COMISION_CURRICULAR:
      return <CoordinadorDashboard />;

    case UsuarioDepartamentoDTORolesItem.ADMINISTRACION:
      return <AdministracionDashboard />;
    default:
      return <div className="p-8 max-w-7xl mx-auto">Seleccione un rol para ver el panel correspondiente.</div>;
  }
}
