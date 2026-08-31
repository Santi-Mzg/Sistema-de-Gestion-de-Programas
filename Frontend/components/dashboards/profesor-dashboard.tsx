"use client"

import { AlertCircle, Home, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgramaResponseReducedDTO } from "@/app/api/generated/model/programaResponseReducedDTO";
import { getGetDashboardResumenQueryKey, getListProgramasPendientesQueryKey, getListProgramasQueryKey, useGetDashboardResumen, useListProgramas, useListProgramasPendientes } from "@/app/api/generated/client";
import { EstadoHistoricoResponseDTOEstado, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { ProgramasListReduced } from "../pages/programas-list-reduced";
import { useRouter } from "next/navigation"
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { useHeader } from "@/context/header-context";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { DashboardStats } from "../ui/cardsStatsDocente";

export function ProfesorDashboard() {
  const { activeDepartamento } = useDept();
  const { activeRole } = useRole();
  const { user } = useAuth();
  const {setHeader} = useHeader();
  const router = useRouter();
  const [page, setPage] = useState(0)
  const pageSize = 10

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

  const dashboardStatsQuery = useGetDashboardResumen(
    activeDepartamento!.departamentoId!,
    {
      rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
    },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        staleTime: 1000 * 60 * 5,
        queryKey: getGetDashboardResumenQueryKey(
          activeDepartamento!.departamentoId!,
          {
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          }
        ),
      }, 
    }
  );

  const stats = dashboardStatsQuery.data ?? undefined


  const programasQuery = useListProgramasPendientes(
      activeDepartamento!.departamentoId!,
      {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
        page,
        size: pageSize
      },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        staleTime: 1000 * 60 * 5,
        queryKey: getListProgramasPendientesQueryKey(
          activeDepartamento!.departamentoId!,
          {
            rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
            page,
            size: pageSize
          }
        ),
      }, 
    }
  );

  const programas: ProgramaResponseReducedDTO[] = programasQuery.data?.content || [];
  const totalPages = programasQuery.data?.totalPages ?? 0
  const totalElements = programasQuery.data?.totalElements ?? 0

  const handleNavigate = (id: number) => {
    router.push(`/programas/${id}/carga/docente`);
  };

  const pendientesRef = useRef<HTMLDivElement>(null)

  const handlePendingClick = () => {
    pendientesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

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

    if (programasQuery.isLoading || dashboardStatsQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        )
    }

    if (programasQuery.error || dashboardStatsQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al cargar los programas</p>
          </div>
        </div>
      )
    }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {stats &&
        <DashboardStats     
          programasAsignados={stats.programasTotales ?? 0}
          programasVigentes={stats.programasVigentes ?? 0}
          programasEnCurso={(stats.programasTotales ?? 0) - (stats.programasVigentes ?? 0)}

          enAdministracion={stats.pendienteAdministracion ?? 0}
          enDocente={stats.pendienteDocente ?? 0}
          enComision={stats.pendienteComisiones ?? 0}
          enSecretaria={stats.pendienteSecretaria ?? 0}

          nuevosParaCompletar={(stats.pendienteDocente ?? 0) - (stats.rechazadoDocente ?? 0)}
          rechazadosAlDocente={stats.rechazadoDocente ?? 0}

          onPendingClick={handlePendingClick}
        />
      }
      <div
        ref={pendientesRef}
        className="scroll-mt-24"
      >
        <Card className="mb-6 mt-6">
          <CardHeader>
            <CardTitle>
                Pendientes
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ProgramasListReduced programas={programas} page={page} pageSize={pageSize} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} onRowClick={handleNavigate}/>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
