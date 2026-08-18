"use client"

import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useHeader } from "@/context/header-context";
import { AlertCircle, Home, User } from "lucide-react";
import { getGetDashboardResumenQueryKey, useGetDashboardResumen } from "@/app/api/generated/client";
import { UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { DashboardStats } from "../ui/cardsStatsDirAdmin";


export function DirAdminDashboard() {
    const { activeDepartamento } = useDept();
    const { activeRole } = useRole();
    const { user } = useAuth();
    const {setHeader} = useHeader();
    
    useEffect(() => {
      setHeader({
        title: "Panel Administrativo",
        subtitle: "Visualiza y gestiona las informaciones departamentales",
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
        <DashboardStats stats={stats}/>
      }
    </div>
  )
}
