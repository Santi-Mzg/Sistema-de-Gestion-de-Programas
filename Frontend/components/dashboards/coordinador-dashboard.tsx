"use client"

import { Users, CheckCircle2, AlertCircle, User, Home, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { getListProgramasPendientesCoordinadorQueryKey, useListProgramasPendientesCoordinador } from "@/app/api/generated/client";
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { ProgramasListReducedCoord } from "../pages/programas-list-reduced-coordinador";
import { useEffect } from "react";
import { useHeader } from "@/context/header-context";
import { useAuth } from "@/context/auth-context";


export function CoordinadorDashboard() {
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const { user } = useAuth();
  const {setHeader} = useHeader();
    
  useEffect(() => {
    setHeader({
      title: "Panel de Coordinación de la Comisión Curricular",
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

  const programasQuery = useListProgramasPendientesCoordinador(
      activeDepartamento!.departamentoId!,
      {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
      },
    {
      query: {
        enabled: !!activeDepartamento?.departamentoId && !!activeRole,
        staleTime: 1000 * 60 * 5,
        queryKey: getListProgramasPendientesCoordinadorQueryKey(
            activeDepartamento!.departamentoId!,
            {
              rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
            }
        )
      } 
    }
  );
  const programasPendientes: ProgramaResponseDTO[] = programasQuery.data || [];


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
              <Users size={16} className="text-primary" />
              Carreras Asignadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDepartamento?.carrerasComoComision?.map(c => (
              <div className="text-md pb-1 font-bold text-primary" key={c}>
                - {c}
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-1">En tu coordinación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock size={16} className="text-orange-600" />
              Programas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{programasPendientes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Esperando revisión</p>
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
            <p className="text-xs text-muted-foreground mt-1">Programas revisados</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Programas Pendientes</CardTitle>
          <CardDescription>Programas que requieren ser revisados</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramasListReducedCoord programas={programasPendientes} />
        </CardContent>
      </Card>
    </div>
  )
}
