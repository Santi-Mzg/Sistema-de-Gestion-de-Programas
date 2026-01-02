"use client"

import { Users, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgramasListReduced } from "../pages/programas-list-reduced"
import { EstadoHistoricoResponseDTOEstado, ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { getListProgramasQueryKey, useListProgramas } from "@/app/api/generated/client";
import { useRouter } from "next/navigation"
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { useAuth } from "@/context/auth-context";


export function CoordinadorDashboard() {
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const router = useRouter();

  // const carrerasId: number[] = activeDepartamento?.carrerasComoComision || [];

  const programasQuery = useListProgramas(
      activeDepartamento!.departamentoId!,
      {
        // carreraId: carrerasId[0],
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
      },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        staleTime: 1000 * 60 * 5,
        queryKey: getListProgramasQueryKey(
            activeDepartamento!.departamentoId!,
            {
              // carreraId: carrerasId[0],
              rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
            }
        )
      } 
    }
  );
  const programas: ProgramaResponseDTO[] = programasQuery.data || [];

  const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.COMPLETO_POR_PROFESOR);


  const handleNavigate = (id: number) => {
    router.push(`/programas/revisar/${id}`);
  };

    if (!activeDepartamento || !activeDepartamento.departamentoId || !activeRole) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando datos de los programas...</p>
          </div>  
        </div>
      )
    }

    if (programasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de los programas...</p>
                </div>
            </div>
        )
    }

    if (programasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener los programas</p>
          </div>
        </div>
      )
    }
  

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
