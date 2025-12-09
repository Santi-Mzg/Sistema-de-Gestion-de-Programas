"use client"

import { FileText, Clock, Archive } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { EstadoHistoricoResponseDTOEstado, ProgramaResponseDTO } from "@/app/api/generated/model";
import { useListProgramas } from "@/app/api/generated/syllabusApi";
import { ProgramasListReduced } from "../pages/programas-list-reduced";
import { useRouter } from "next/navigation"

export function SecretarioDashboard() {
    const { user } = useContext(AuthContext);
    const programas: ProgramaResponseDTO[] = useListProgramas().data || [];
    // const programasFiltrados = programas.filter((programa) => programa.profesorResponsable === user?.apellido+" - "+user?.nombre);
    const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.APROBADO_POR_COMISION);
  

    const router = useRouter();
  
    const handleNavigate = (id: number) => {
      router.push(`/programas/revisar/${id}`);
    };
    
  
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
