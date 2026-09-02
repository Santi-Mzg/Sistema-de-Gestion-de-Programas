"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, AlertCircle, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ProgramasListReduced } from "../pages/programas-list-reduced"
import { EstadoHistoricoResponseDTOEstado, ProgramaResponseReducedDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { useRole } from "@/context/role-context"
import { useDept } from "@/context/dept-context"
import { getGetDashboardResumenQueryKey, getListProgramasPendientesQueryKey, getListProgramasQueryKey, useGetDashboardResumen, useListProgramas, useListProgramasPendientes } from "@/app/api/generated/client"
import { useAuth } from "@/context/auth-context"
import { useHeader } from "@/context/header-context"
import { useRouter } from "next/navigation"
import { DashboardStats } from "../ui/cardsStatsAdmin"
import { MateriasList } from "../pages/materias-list"


export function AdministracionDashboard() {
  const [showForm, setShowForm] = useState(false)
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const { user } = useAuth();
  const {setHeader} = useHeader();
  const [page, setPage] = useState(0)
  const pageSize = 2
  const router = useRouter()

  const handleNavigate = (id: number) => {
    router.push(`/programas/${id}/carga/administracion`);
  };

  useEffect(() => {
    setHeader({
      title: "Panel de Administración",
      subtitle: "Visualiza y gestiona los programas departamentales",
      badge: (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <User className="text-primary" size={20} />
          <span className="font-semibold text-primary">Bienvenido {user?.nombre}</span>
        </div>
      ),
      icon: Home
    })
  }, [user]);
  
  const programasQuery = useListProgramasPendientes(
      activeDepartamento!.departamentoId!,
      {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
        page,
        size: pageSize,
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
              size: pageSize,
            }
          ),
        }, 
      }
  );

  const programas: ProgramaResponseReducedDTO[] = programasQuery.data?.content ?? []
  const totalPages = programasQuery.data?.totalPages ?? 0
  const totalElements = programasQuery.data?.totalElements ?? 0

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
            <p className="text-yellow-700">Cargando datos...</p>
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
        <DashboardStats stats={stats} onPendingClick={handlePendingClick}/>
      }
      <div className="mb-6 mt-6">
        <Link href={"/programas/crear"}>
          <Button
            className="gap-2 bg-primary hover:bg-accent text-primary-foreground"
            size="lg"
          >
            <Plus size={20} />
            {showForm ? "Cancelar" : "Crear Nuevo Programa"}
          </Button>
        </Link>
      </div>

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

        {/* <Card className="mb-6 mt-6">
          <CardHeader>
            <CardTitle>
              Materias sin programa en este ciclo lectivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MateriasList materias={materias} page={page} pageSize={pageSize} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage}/>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}

