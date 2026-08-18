"use client"

import { ProgramasList } from "@/components/pages/programas-list";
import { ProgramaResponseDTOEstado, UsuarioDepartamentoDTORolesItem } from "../../api/generated/model";
import { getListProgramasCoordinacionQueryKey, getListProgramasQueryKey, useListProgramas, useListProgramasCoordinacion } from "../../api/generated/client";
import { useDept } from "@/context/dept-context";
import { useRole } from "@/context/role-context";
import { ProgramasListCoordinador } from "@/components/pages/programas-list-coordinador";
import { useEffect, useMemo, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { getProgramStateLabel } from "@/lib/utils";


export default function Programas() {

    const [page, setPage] = useState(0)
    const pageSize = 10

    // filtros generales
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [estado, setEstado] = useState<string>("todos")

    // filtro exclusivo de coordinación
    const [carrera, setCarrera] = useState<string>("todos")

    const { activeDepartamento } = useDept()
    const { activeRole } = useRole()

    const deptId = activeDepartamento?.departamentoId
    const isCoordinacion = activeRole === UsuarioDepartamentoDTORolesItem.COORDINACION_COMISION_CURRICULAR;

    useEffect(() => {
      const timeout = setTimeout(() => {
        setSearch(searchInput.trim())
        setPage(0)
      }, 1000)
    
      return () => clearTimeout(timeout)
    }, [searchInput])

    const programasCoordinacionQuery = useListProgramasCoordinacion(
        deptId!,
        {
          rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          page,
          size: pageSize,
          search: search || undefined,
          estado:
            estado === "todos"
              ? undefined
              : estado as ProgramaResponseDTOEstado,
          carrera:
            carrera === "todos"
              ? undefined
              : carrera,
        },
        {
          query: {
            enabled: !!deptId && !!activeRole && isCoordinacion,
            staleTime: 1000 * 60 * 5,    
            refetchOnWindowFocus: false,
            queryKey: getListProgramasCoordinacionQueryKey(deptId!, 
              {
                rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
                page,
                size: pageSize,
                search: search || undefined,
                estado:
                  estado === "todos"
                    ? undefined
                    : estado as ProgramaResponseDTOEstado,
                carrera:
                  carrera === "todos"
                    ? undefined
                    : carrera,
              }),
          },
        }
    );

    const programasQuery = useListProgramas(
        deptId!,
        {
          rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
          page,
          size: pageSize,
          search: search || undefined,
          estado:
            estado === "todos"
              ? undefined
              : estado as ProgramaResponseDTOEstado,
        },
        {
          query: {
            enabled: !!deptId && !!activeRole && !isCoordinacion,
            staleTime: 1000 * 60 * 5,    
            refetchOnWindowFocus: false,
            queryKey: getListProgramasQueryKey(deptId!,
              {
                rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
                page,
                size: pageSize,
                search: search || undefined,
                estado:
                  estado === "todos"
                    ? undefined
                    : estado as ProgramaResponseDTOEstado,
              }),
          },
        }
    );
    
    const pathname = usePathname() // 2. Obtener la ruta actual
    const router = useRouter()
    const esVistaVersiones = pathname.includes("/versiones")

    
    const estadosDisponibles = Object.values(ProgramaResponseDTOEstado)

    const uniqueCarreraPlanes = useMemo(() => {
      return [...new Set(activeDepartamento?.carrerasComoComision)]
    }, [activeDepartamento?.carrerasComoComision])

    const handleEstadoChange = (value: string) => {
      setEstado(value)
      setPage(0)
    }

    const handleCarreraChange = (value: string) => {
      setCarrera(value)
      setPage(0)
    } 
  
    const isReady = !!deptId && !!activeRole && (programasQuery.isSuccess || programasCoordinacionQuery.isSuccess);

    // if (!isReady) {
    //   // return <LoadingSpinner text="Cargando datos de los programas..." />
    //   return (
    //     <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
    //       <div className="text-center">
    //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
    //         <p className="text-yellow-700">Cargando datos de los programas...</p>
    //       </div>  
    //     </div>
    //   )
    // }


    
    if(isCoordinacion) {
        const programas = programasCoordinacionQuery.data?.content ?? []
        const totalPages = programasCoordinacionQuery.data?.totalPages ?? 0
        const totalElements = programasCoordinacionQuery.data?.totalElements ?? 0
        return (
          <>
            <div className="space-y-6 mb-8">    
              {/* Filter Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Filter size={16} /> Carrera - Plan
                  </label>
                  <select
                    value={carrera}
                    onChange={(e) => handleCarreraChange(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="todos">Todas las carreras</option>
                    {uniqueCarreraPlanes.map((carreraPlan) => (
                      <option key={carreraPlan} value={carreraPlan || ""}>
                        {carreraPlan}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Filter size={16} /> Estado
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => handleEstadoChange(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="todos">Todos los estados</option>
                    {estadosDisponibles.map((estado) => (
                      <option key={estado} value={estado || ""}>
                        {getProgramStateLabel(estado as ProgramaResponseDTOEstado)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Search Bar */}
              <div className="mb-4 flex md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder="Buscar por nombre, código, docente o departamento..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-12 py-3 text-base border-2 border-border rounded-xl"
                  />
                </div>
              </div>
            </div>
            {!isReady && (
                <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-yellow-700">Cargando programas...</p>
                  </div>  
                </div>
              ) || (
                <ProgramasListCoordinador
                  programas={programas}
                  page={page}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  filterCarreraPlan={carrera}
                  onPageChange={setPage}
                />   
              )}
          </>
       )
    }
    else {
        const programas = programasQuery.data?.content ?? []
        const totalPages = programasQuery.data?.totalPages ?? 0
        const totalElements = programasQuery.data?.totalElements ?? 0
        return (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-muted/30 p-3 rounded-lg border">              
                <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nombre, código, docente o departamento..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-md" // h-9 para hacerlo más bajo
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter size={16} />
                <select
                  value={estado}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="h-9 px-3 py-1 text-sm border rounded-md bg-background"
                >
                  <option value="todos">Todos los estados</option>
                  {estadosDisponibles.map((estado) => (
                    <option key={estado} value={estado || ""}>
                      {getProgramStateLabel(estado as ProgramaResponseDTOEstado)}
                    </option>
                  ))}
                </select>
                {!esVistaVersiones && (activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
                  activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
                  <Button size="sm" onClick={() => router.push(`/programas/crear`)} className="h-9">
                    <Plus size={16} className="mr-1" /> Nuevo Programa
                  </Button>
                }
              </div>
            </div>
            {!isReady && (
              <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-yellow-700">Cargando programas...</p>
                </div>  
              </div>
            ) || (
              <ProgramasList
                programas={programas}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setPage}
                esVistaVersiones={esVistaVersiones}
              />
            )}
          </>
        )
    }
}
