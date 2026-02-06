"use client"

import { useEffect, useState } from "react"
import { Plus, BookOpen, Eye, Trash2, AlertCircle, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ProgramasListReduced } from "../pages/programas-list-reduced"
import { useRouter } from "next/navigation"
import { EstadoHistoricoResponseDTOEstado, ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { useRole } from "@/context/role-context"
import { useDept } from "@/context/dept-context"
import { getListProgramasQueryKey, useListProgramas } from "@/app/api/generated/client"
import { JSX } from "react/jsx-runtime"
import { useAuth } from "@/context/auth-context"
import { useHeader } from "@/context/header-context"


export function AdministracionDashboard() {
  const [showForm, setShowForm] = useState(false)
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const { user } = useAuth();
  const {setHeader} = useHeader();

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
  const programasPendientes = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.INCOMPLETO_POR_ADMINISTRACION);
  const programasRechazados = programas.filter((programa) => programa.estado === EstadoHistoricoResponseDTOEstado.RECHAZADO_A_ADMINISTRACION);


  const router = useRouter();

  const handleNavigate = (id: number) => {
    router.push(`/programas/${id}/carga/administracion`);
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
      {/* Action Button */}
      <div className="mb-6">
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
    </div>
  )
}

