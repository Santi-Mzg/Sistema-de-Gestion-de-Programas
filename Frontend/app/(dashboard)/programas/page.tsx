"use client"

import { ProgramasList } from "@/components/pages/programas-list";
import { EstadoPrograma, Rol } from "../../api/generated/model";
import { getGetAniosProgramasQueryKey, getListProgramasCoordinacionQueryKey, getListProgramasQueryKey, useGetAniosProgramas, useListProgramas, useListProgramasCoordinacion } from "../../api/generated/client";
import { useDept } from "@/context/dept-context";
import { useRole } from "@/context/role-context";
import { ProgramasListCoordinador } from "@/components/pages/programas-list-coordinador";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn, getProgramStateLabel } from "@/lib/utils";
import { singleLineFieldStyles } from "@/lib/form-field-styles";


export default function Programas() {

    const [page, setPage] = useState(0)
    const pageSize = 10
    const anioActual = new Date().getFullYear()
    const [anio, setAnio] = useState(anioActual)

    // filtros generales
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [estado, setEstado] = useState<string>("todos")

    // filtro exclusivo de coordinación
    const [carrera, setCarrera] = useState<string>("todos")

    const { activeDepartamento } = useDept()
    const { activeRole } = useRole()

    const deptId = activeDepartamento?.departamentoId
    const isCoordinacion = activeRole === Rol.COORDINACION_COMISION_CURRICULAR;

    const aniosQuery = useGetAniosProgramas(deptId ?? 0, { rolActivo: activeRole as Rol }, { query: {
      enabled: !!deptId && !!activeRole,
      staleTime: 1000 * 60 * 5,
      retry: false,
      queryKey: [...getGetAniosProgramasQueryKey(deptId, { rolActivo: activeRole as Rol }), { anioActual }],
    } });
    const aniosDisponibles = aniosQuery.data ?? [anioActual]

    useEffect(() => {
      if (aniosQuery.data?.length && !aniosQuery.data.includes(anio)) {
        setAnio(aniosQuery.data[0])
        setPage(0)
      }
    }, [aniosQuery.data, anio])

    useEffect(() => {
      const timeout = setTimeout(() => {
        setSearch(searchInput.trim())
        setPage(0)
      }, 1000)

      return () => clearTimeout(timeout)
    }, [searchInput])

    const parametros = {
      rolActivo: activeRole as Rol,
      anio,
      page,
      size: pageSize,
      search: search || undefined,
      estado: estado === "todos" ? undefined : estado as EstadoPrograma,
    }
    // Orval construye la clave con estos mismos parámetros, incluido el año.
    const parametrosCoordinacion = { ...parametros, carrera: carrera === "todos" ? undefined : carrera }
    const programasCoordinacionQuery = useListProgramasCoordinacion(deptId!, parametrosCoordinacion, { query: {
      enabled: !!deptId && !!activeRole && isCoordinacion,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      queryKey: getListProgramasCoordinacionQueryKey(deptId!, parametrosCoordinacion),
    } });
    const programasQuery = useListProgramas(deptId!, parametros, { query: {
      enabled: !!deptId && !!activeRole && !isCoordinacion,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      queryKey: getListProgramasQueryKey(deptId!, parametros),
    } });


    const estadosDisponibles = Object.values(EstadoPrograma)

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

    const handleAnioChange = (value: number) => {
      if (!aniosDisponibles.includes(value) || value === anio) return
      setAnio(value)
      setPage(0)
    }

    const consulta = isCoordinacion ? programasCoordinacionQuery : programasQuery
    const isReady = !!deptId && !!activeRole && consulta.isSuccess
    const selectorStyles = `${singleLineFieldStyles} border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary`

    return <>
      <div className="mb-4 rounded-lg border bg-muted/30 p-3">
        <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_5.5rem]", isCoordinacion
          ? "xl:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)_minmax(0,1.25fr)_5.5rem]"
          : "xl:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)_5.5rem]")}>
          <div className="min-w-0 space-y-2 md:col-span-2 xl:col-span-1">
            <Label htmlFor="programas-busqueda">Buscar programas</Label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input id="programas-busqueda" placeholder="Nombre, código, docente o departamento..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
            </div>
          </div>
          {isCoordinacion && <div className="min-w-0 space-y-2 md:col-span-2 xl:col-span-1">
            <Label htmlFor="programas-carrera">Carrera</Label>
            <select id="programas-carrera" value={carrera} onChange={e => handleCarreraChange(e.target.value)} className={selectorStyles}>
              <option value="todos">Todas las carreras</option>
              {uniqueCarreraPlanes.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
            </select>
          </div>}
          <div className="min-w-0 space-y-2">
            <Label htmlFor="programas-estado">Estado</Label>
            <select id="programas-estado" value={estado} onChange={e => handleEstadoChange(e.target.value)} className={selectorStyles}>
              <option value="todos">Todos los estados</option>
              {estadosDisponibles.map(estado => <option key={estado} value={estado}>{getProgramStateLabel(estado)}</option>)}
            </select>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="programas-anio">Año</Label>
            <select id="programas-anio" value={anio} onChange={e => handleAnioChange(Number(e.target.value))}
              disabled={aniosQuery.isPending || aniosQuery.isError} aria-busy={aniosQuery.isFetching}
              className={cn(selectorStyles, "w-[5.5rem] disabled:cursor-not-allowed disabled:opacity-50")}>
              {aniosDisponibles.map(anio => <option key={anio} value={anio}>{anio}</option>)}
            </select>
          </div>
        </div>
        {aniosQuery.isError && <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 text-sm text-destructive">
          <p>No se pudieron cargar los años disponibles.</p>
          <Button variant="outline" size="sm" onClick={() => { void aniosQuery.refetch() }}>Reintentar años</Button>
        </div>}
      </div>
      {consulta.isError ? <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="flex-1 text-destructive">No se pudieron cargar los programas del año {anio}.</p>
        <Button variant="outline" onClick={() => { void consulta.refetch() }}>Reintentar</Button>
      </div> : !isReady ? <div role="status" className="flex min-h-48 items-center justify-center p-6">
        <div className="text-center">
          <div aria-hidden="true" className="mx-auto mb-3 size-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Cargando programas de {anio}...</p>
        </div>
      </div> : isCoordinacion ? <ProgramasListCoordinador
        programas={programasCoordinacionQuery.data?.content ?? []} anio={anio}
        page={page} pageSize={pageSize} totalPages={consulta.data?.totalPages ?? 0}
        totalElements={consulta.data?.totalElements ?? 0} filterCarreraPlan={carrera} onPageChange={setPage}
      /> : <ProgramasList programas={programasQuery.data?.content ?? []} anio={anio}
        page={page} pageSize={pageSize} totalPages={consulta.data?.totalPages ?? 0}
        totalElements={consulta.data?.totalElements ?? 0} esVistaVersiones={false} onPageChange={setPage}
      />}
    </>
}
