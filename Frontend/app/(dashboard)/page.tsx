"use client"

import { AdministracionDashboard } from "@/components/dashboards/administracion-dashboard"
import { DocenteDashboard } from "@/components/dashboards/docente-dashboard"
import { CoordinadorDashboard } from "@/components/dashboards/coordinador-dashboard"
import { SecretarioDashboard } from "@/components/dashboards/secretario-dashboard"
import { useRole } from "@/context/role-context"
import { Rol } from "../api/generated/model"
import { useDept } from "@/context/dept-context"
import { DirAdminDashboard } from "@/components/dashboards/dir-admin-dashboard"


import { CoordinadorAreaDashboard } from '@/components/dashboards/coordinador-area-dashboard';

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
    case Rol.COORDINADOR_AREA:
      return <CoordinadorAreaDashboard />;

    case Rol.SYSTEM_ADMIN:
      return <DirAdminDashboard />;

    case Rol.DIRECCION_ADMINISTRATIVA:
      return <DirAdminDashboard />;

    case Rol.SECRETARIA:
      return <SecretarioDashboard />;

    case Rol.COORDINACION_COMISION_CURRICULAR:
      return <CoordinadorDashboard />;

    case Rol.ADMINISTRACION:
      return <AdministracionDashboard />;

    case Rol.DOCENTE:
      return <DocenteDashboard />;
    default:
      return <div className="p-8 max-w-7xl mx-auto">Seleccione un rol para ver el panel correspondiente.</div>;
  }
}
