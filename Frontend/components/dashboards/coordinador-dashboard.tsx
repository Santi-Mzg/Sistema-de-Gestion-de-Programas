"use client"

import { Users, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgramasListReduced } from "../pages/programas-list-reduced"
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { EstadoHistoricoResponseDTOEstado, ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { useListProgramas } from "@/app/api/generated/client";
import { useRouter } from "next/navigation"
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";


export function CoordinadorDashboard() {
  const { user } = useContext(AuthContext);
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const router = useRouter();

  const programas: ProgramaResponseDTO[] = useListProgramas({
    departamentoId: activeDepartamento?.departamentoId,
    // carreraId: activeDepartamento?.carreraId,
    rolActivo: activeRole || UsuarioDepartamentoDTORolesItem.COORDINACION_COMISION_CURRICULAR
  }).data || [];
  const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.COMPLETO_POR_PROFESOR);


  const handleNavigate = (id: number) => {
    router.push(`/programas/revisar/${id}`);
  };
  

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Panel del Coordinador</h1>
        <p className="text-muted-foreground">Revisa y coordina sílabus de docentes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Profesores Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12</div>
            <p className="text-xs text-muted-foreground mt-1">En tu coordinación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground mt-1">Sílabus revisados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-600" />
              Por Revisar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">4</div>
            <p className="text-xs text-muted-foreground mt-1">Esperando revisión</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programas en Revisión</CardTitle>
          <CardDescription>Programas que requieren tu aprobación</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasPendientes} onRowClick={handleNavigate} />
        </CardContent>
      </Card>
    </div>
  )
}
