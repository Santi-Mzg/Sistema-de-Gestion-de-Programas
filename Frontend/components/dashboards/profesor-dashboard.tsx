"use client"

import { BookOpen, BarChart3, Clock, AlertCircle, Home, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgramaResponseDTO } from "@/app/api/generated/model/programaResponseDTO";
import { getListProgramasQueryKey, useListProgramas } from "@/app/api/generated/client";
import { EstadoHistoricoResponseDTOEstado, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { ProgramasListReduced } from "../pages/programas-list-reduced";
import { useRouter } from "next/navigation"
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { useHeader } from "@/context/header-context";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export function ProfesorDashboard() {
  const { activeDepartamento } = useDept();
  const { activeRole } = useRole();
  const { user } = useAuth();
  const {setHeader} = useHeader();
  
  useEffect(() => {
    setHeader({
      title: "Panel de Docente",
      subtitle: "Visualiza y gestiona los programas asignados",
      badge: (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <User className="text-primary" size={20} />
          <span className="font-semibold text-primary">Bienvenido {user?.nombre}</span>
        </div>
      ),
      icon: Home
    })
  }, [user]);

  const programasQuery = useListProgramas(
      activeDepartamento!.departamentoId!,
      {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
      },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        staleTime: 1000 * 60 * 5,
        queryKey: getListProgramasQueryKey(
          activeDepartamento!.departamentoId!,
          {
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          }
        ),
      }, 
    }
  );

  const programas: ProgramaResponseDTO[] = programasQuery.data || [];

  
  const programasVigentes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.APROBADO_POR_SECRETARIA);
  const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.INCOMPLETO_POR_PROFESOR || programa.estado === EstadoHistoricoResponseDTOEstado.COMPLETO_POR_ADMINISTRACION);
  const programasRechazados = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.RECHAZADO_A_PROFESOR);

  const router = useRouter();

  const handleNavigate = (id: number) => {
    router.push(`/programas/completar/docente_responsable/${id}`);
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
              Programas Pendientes
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pendientes</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasPendientes} onRowClick={handleNavigate} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rechazados</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasRechazados} onRowClick={handleNavigate} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mis Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramasListReduced programas={programasVigentes} onRowClick={handleNavigate} />
        </CardContent>
      </Card>

    </div>
  )
}
