"use client"

import { AdministracionDashboard } from "@/components/dashboards/administracion-dashboard"
import { ProfesorDashboard } from "@/components/dashboards/profesor-dashboard"
import { CoordinadorDashboard } from "@/components/dashboards/coordinador-dashboard"
import { SecretarioDashboard } from "@/components/dashboards/secretario-dashboard"
import { useRole } from "@/context/role-context"
import { UsuarioDepartamentoDTORolesItem } from "../api/generated/model"
import { useDept } from "@/context/dept-context"


export default function Dashboard() {
  const { activeDepartamento } = useDept();
  const { activeRole } = useRole();

  if (!activeDepartamento || !activeDepartamento.departamentoId || !activeRole) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando...</p>
        </div>  
      </div>
    )
  }

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
