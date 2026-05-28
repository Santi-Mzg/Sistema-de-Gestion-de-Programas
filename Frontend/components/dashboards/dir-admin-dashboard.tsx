"use client"

import { FileText, Clock, Archive, AlertCircle, User, Home, Users, GraduationCap, BookOpenText, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaResponseDTO, CarreraResponseDTO, EstadoHistoricoResponseDTOEstado, MateriaResponseDTO, ProgramaResponseDTO, UserResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { getListAreasDepartamentoQueryKey, getListCarrerasDepartamentoQueryKey, getListMateriasDepartamentoQueryKey, getListProgramasQueryKey, getListUsersDepartamentoQueryKey, useListAreasDepartamento, useListCarrerasDepartamento, useListMateriasDepartamento, useListProgramas, useListUsersDepartamento } from "@/app/api/generated/client";
import { ProgramasListReduced } from "../pages/programas-list-reduced";
import { useRouter } from "next/navigation"
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useHeader } from "@/context/header-context";


export function DirAdminDashboard() {
    const { activeDepartamento } = useDept();
    const { activeRole } = useRole();
    const { user } = useAuth();
    const {setHeader} = useHeader();
    const router = useRouter();
    
    useEffect(() => {
      setHeader({
        title: "Panel de Secretaría",
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
          gcTime: 1000 * 60 * 10,
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

  
    const usuariosQuery = useListUsersDepartamento(activeDepartamento?.departamentoId ?? 0,
        {
          query: {
            enabled: !!activeDepartamento?.departamentoId,
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            queryKey: getListUsersDepartamentoQueryKey(activeDepartamento?.departamentoId)
          }
        }
    );

    const usuarios: UserResponseDTO[] = usuariosQuery.data || [];

    const usuariosAdministrativos = usuarios?.filter((usuario) => usuario.departamentos?.find((d) => d.departamentoId === activeDepartamento?.departamentoId)?.roles?.some((rol) => rol === UsuarioDepartamentoDTORolesItem.ADMINISTRACION));

    const usuariosDocentes = usuarios?.filter((usuario) => usuario.departamentos?.find((d) => d.departamentoId === activeDepartamento?.departamentoId)?.roles?.some((rol) => rol === UsuarioDepartamentoDTORolesItem.DOCENTE));


    const carrerasQuery = useListCarrerasDepartamento(activeDepartamento?.departamentoId ?? 0, 
      {
        query: {
          enabled: !!activeDepartamento?.departamentoId,
          staleTime: 1000 * 60 * 5,
          queryKey: getListCarrerasDepartamentoQueryKey(activeDepartamento?.departamentoId)
        }
      }
    );
    const carreras: CarreraResponseDTO[] = carrerasQuery.data || [];

    const materiasQuery = useListMateriasDepartamento(activeDepartamento?.departamentoId ?? 0, 
      {
        query: {
          enabled: !!activeDepartamento?.departamentoId,
          queryKey: getListMateriasDepartamentoQueryKey(activeDepartamento?.departamentoId)
        }
      }
    );
    const materias: MateriaResponseDTO[] = materiasQuery.data || [];;

    const areasQuery = useListAreasDepartamento(activeDepartamento?.departamentoId ?? 0, 
      {
        query: {
          enabled: !!activeDepartamento?.departamentoId,
          queryKey: getListAreasDepartamentoQueryKey(activeDepartamento?.departamentoId)
        }
      }
    );
    const areas: AreaResponseDTO[] = areasQuery.data || [];;



    if (materiasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de las materias...</p>
                </div>
            </div>
        )
    }

    if (materiasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las materias</p>
          </div>
        </div>
      )
    }

    if (areasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de las áreas...</p>
                </div>
            </div>
        )
    }

    if (areasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las áreas</p>
          </div>
        </div>
      )
    }


    if (carrerasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de las carreras...</p>
                </div>
            </div>
        )
    }

    if (carrerasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las carreras</p>
          </div>
        </div>
      )
    }


    if (usuariosQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de los usuarios...</p>
                </div>
            </div>
        )
    }

    if (usuariosQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener los usuarios</p>
          </div>
        </div>
      )
    }
  

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
              <FileText size={16} className="text-primary" />
              Programas Vigentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{programasVigentes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aprobados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              Programas en Proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{programas.length - programasVigentes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Este período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Usuarios del departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">{usuarios.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Totales</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{usuariosAdministrativos.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Administrativos</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">{usuariosDocentes.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Docentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap size={16} className="text-primary" />
              Carreras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{carreras.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              Áreas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{areas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpenText size={16} className="text-primary" />
              Materias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{materias.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas</p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
