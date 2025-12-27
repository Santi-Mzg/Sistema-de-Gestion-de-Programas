"use client"

import { FileText, Clock, Archive, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EstadoHistoricoResponseDTOEstado, ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { useListProgramas } from "@/app/api/generated/client";
import { ProgramasListReduced } from "../pages/programas-list-reduced";
import { useRouter } from "next/navigation"
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";


export function SecretarioDashboard() {
    const { activeDepartamento } = useDept();
    const { activeRole } = useRole();
    
    const programasQuery = useListProgramas(
        activeDepartamento!.departamentoId!,
        {
          rolActivo: activeRole as UsuarioDepartamentoDTORolesItem || UsuarioDepartamentoDTORolesItem.SECRETARIA,
        },
      {
        query: {
          enabled: !!activeDepartamento?.departamentoId && !!activeRole,
          queryKey: useListProgramas(
            activeDepartamento!.departamentoId!,
            {
              rolActivo: activeRole as UsuarioDepartamentoDTORolesItem || UsuarioDepartamentoDTORolesItem.SECRETARIA,
            }
          ).queryKey,
        }, 
      }
    );


    const programas: ProgramaResponseDTO[] = programasQuery.data || [];

    const programasVigentes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.APROBADO_POR_SECRETARIA);

    const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.APROBADO_POR_COMISION);
  

    const router = useRouter();
  
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Panel del Secretario</h1>
        <p className="text-muted-foreground">Gestiona archivos y documentación de sílabus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">45</div>
            <p className="text-xs text-muted-foreground mt-1">En archivo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              Próximos Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">2</div>
            <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Archive size={16} className="text-secondary" />
              Archivados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">23</div>
            <p className="text-xs text-muted-foreground mt-1">Períodos anteriores</p>
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
