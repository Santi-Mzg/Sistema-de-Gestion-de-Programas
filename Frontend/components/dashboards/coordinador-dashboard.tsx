"use client"

import { AlertCircle, User, Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EstadoPrograma, ProgramaResponseDTO, Rol } from "@/app/api/generated/model";
import {
  getGetDashboardResumenQueryKey,
  getListProgramasPendientesCoordinadorQueryKey,
  useGetDashboardResumen,
  useListProgramasPendientesCoordinador,
  getListCarrerasAsignadasQueryKey,
  useListCarrerasAsignadas
} from "@/app/api/generated/client";
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { ProgramasListReducedCoord } from "../pages/programas-list-reduced-coordinador";
import { useEffect, useRef, useState } from "react";
import { useHeader } from "@/context/header-context";
import { useAuth } from "@/context/auth-context";
import { DashboardStats } from "../ui/cardsStatsCoord";


export function CoordinadorDashboard() {
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const { user } = useAuth();
  const deptId = activeDepartamento?.departamentoId ?? 0;
  const {setHeader} = useHeader();
  const [page, setPage] = useState(0)
  const pageSize = 2;
    
  useEffect(() => {
    setHeader({
      title: "Panel de coordinación de la comisión curricular",
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
    deptId,
    {
      rolActivo: activeRole as Rol,
    },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        staleTime: 1000 * 60 * 5,
        queryKey: getGetDashboardResumenQueryKey(
          deptId,
          {
            rolActivo: activeRole as Rol,
          }
        ),
      }, 
    }
  );

  const stats = dashboardStatsQuery.data ?? undefined


  const programasQuery = useListProgramasPendientesCoordinador(
      deptId,
      {
        rolActivo: activeRole as Rol,
        page,
        size: pageSize,
      },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        staleTime: 1000 * 60 * 5,
        queryKey: getListProgramasPendientesCoordinadorQueryKey(
            deptId,
            {
              rolActivo: activeRole as Rol,
              page,
              size: pageSize,
            }
        )
      } 
    }
  );
  const programas: ProgramaResponseDTO[] = programasQuery.data?.content || [];
  const totalPages = programasQuery.data?.totalPages ?? 0
  const totalElements = programasQuery.data?.totalElements ?? 0
  const carrerasParams = { page: 0, size: 5, search: undefined };
  const carrerasQuery = useListCarrerasAsignadas(deptId, carrerasParams, { query: {
    enabled: !!deptId && !!user?.id && activeRole === 'COORDINACION_COMISION_CURRICULAR',
    staleTime: 0,
    queryKey: [...getListCarrerasAsignadasQueryKey(deptId, carrerasParams), { usuarioId: user?.id, rol: activeRole }],
  } });

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

    if (programasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando...</p>
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

    if (dashboardStatsQuery.isLoading) {
      return (
          <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando...</p>
              </div>
          </div>
      )
    }

    if (dashboardStatsQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener los datos del departamento</p>
          </div>
        </div>
      )
    }
  

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {stats &&
        <DashboardStats 
          stats={stats}
          carreras={carrerasQuery.data?.content ?? []}
          totalCarreras={carrerasQuery.data?.totalElements ?? 0}
          cargandoCarreras={carrerasQuery.isLoading}
          errorCarreras={!!carrerasQuery.error}
          pendientesRevision={totalElements}
          onPendingClick={handlePendingClick}
        />
      }
      <div
        ref={pendientesRef}
        className="scroll-mt-24"
      >
        <Card className="mb-6 mt-6">
          <CardHeader>
            <CardTitle>Programas pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgramasListReducedCoord programas={programas} page={page} pageSize={pageSize} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage}/>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
