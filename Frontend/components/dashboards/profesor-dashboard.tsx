"use client"

import { BookOpen, BarChart3, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgramaResponseDTO } from "@/app/api/generated/model/programaResponseDTO";
import { useListProgramas } from "@/app/api/generated/syllabusApi";
import { EstadoHistoricoResponseDTOEstado } from "@/app/api/generated/model";
import { ProgramasListReduced } from "../pages/programas-list-reduced";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation"

export function ProfesorDashboard() {
  const { user } = useContext(AuthContext);
  const programas: ProgramaResponseDTO[] = useListProgramas().data || [];
  // const programasFiltrados = programas.filter((programa) => programa.profesorResponsable === user?.apellido+" - "+user?.nombre);
  const programasVigentes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.APROBADO_POR_SECRETARIA);
  const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.INCOMPLETO_POR_PROFESOR || programa.estado === EstadoHistoricoResponseDTOEstado.COMPLETO_POR_ADMINISTRACION);
  const programasRechazados = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.RECHAZADO_A_PROFESOR);

  const router = useRouter();

  const handleNavigate = (id: number) => {
    router.push(`/programas/completar/${id}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Panel del Profesor</h1>
        <p className="text-muted-foreground">Visualiza y edita tus sílabus asignados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              Mis Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground mt-1">Este semestre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              Sílabus Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">1</div>
            <p className="text-xs text-muted-foreground mt-1">Por completar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 size={16} className="text-secondary" />
              Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">2</div>
            <p className="text-xs text-muted-foreground mt-1">Por administración</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mis Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasVigentes} onRowClick={handleNavigate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rechazados</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasRechazados} onRowClick={handleNavigate} />
        </CardContent>
      </Card>

            <Card>
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasPendientes} onRowClick={handleNavigate} />
        </CardContent>
      </Card>

    </div>
  )
}
