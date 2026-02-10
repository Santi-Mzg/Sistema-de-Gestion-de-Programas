"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Plus, Eye, FileText, History, FolderClock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProgramaResponseDTO, ProgramaResponseDTOEstado, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useRole } from "@/context/role-context"
import Link from "next/link"
import { useHeader } from "@/context/header-context"
import { getProgramStateLabel, getProgramStateStyles } from "@/lib/utils"
import { useDept } from "@/context/dept-context"

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[]
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type SortField = "anio" | "nombreMateria" | "carreraPlan" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasListCoordinador({ programas = [] }: ProgramasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const { activeDepartamento } = useDept()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("nombreMateria")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterCarreraPlan, setFilterCarreraPlan] = useState<string>("todos")

  const pathname = usePathname() // 2. Obtener la ruta actual
  const esVistaVersiones = pathname.includes("/versiones")

  
  useEffect(() => {
    setHeader({
      title: `Programas`,
      subtitle: "Gestiona y consulta los programas disponibles",
      icon: FileText,
    })
  }, [])

  // Get unique values for filters
  const uniqueEstados = useMemo(() => {
    return [...new Set(programas.map((s) => getProgramStateLabel(s.estado as ProgramaResponseDTOEstado)).filter(Boolean))]
  }, [programas])

  const uniqueCarreraPlanes = useMemo(() => {
    return [...new Set(activeDepartamento?.carrerasComoComision)]
  }, [activeDepartamento?.carrerasComoComision])

  // Filter and sort data
  const rows = useMemo(() => {
    return programas.flatMap(programa =>
      (programa.bloqueMultiple || [])
        .filter(rel =>
          activeDepartamento?.carrerasComoComision?.includes(rel.carreraNombre!)
        )
        .map(rel => ({
          programa,
          relacion: rel,
        }))
    )
  }, [programas, activeDepartamento])

  const filteredAndSortedRows = useMemo(() => {
  const filtered = rows.filter(({ programa, relacion }) => {
    const matchesSearch =
      !searchTerm ||
      programa.materia?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.materia?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.profesorResponsable?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.profesorResponsable?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.profesorResponsable?.legajo?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesEstado =
        filterEstado === "todos" ||
        getProgramStateLabel(programa.estado as ProgramaResponseDTOEstado) === filterEstado

      const matchesCarreraPlan =
        filterCarreraPlan === "todos" ||
        relacion.carreraNombre === filterCarreraPlan

      return matchesSearch && matchesEstado && matchesCarreraPlan
    })

    filtered.sort((a, b) => {
      const aValue = String((a.programa as any)[sortField] ?? "")
      const bValue = String((b.programa as any)[sortField] ?? "")
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return filtered

  }, [programas, searchTerm, sortField, sortOrder, filterEstado, filterCarreraPlan])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleGenerarPDF = (programaId?: number) => {
    if (!programaId) return;

    window.open(
      `${BACKEND_URL}/api/programas/${programaId}/pdf`,
      "_blank"
    );
  }

  // 1. Aplanamos la lista para tener una fila por cada carrera/plan
const programasAplanados = programas.flatMap((programa) => {
  const planesAsignados = programa.bloqueMultiple?.filter(b => 
    activeDepartamento?.carrerasComoComision?.includes(b.carreraNombre!)
  ) || [];
  
  return planesAsignados
    .filter(p => !p.aprobadoPorComision)
    .map(relacion => ({
      ...programa,
      relacionEspecifica: relacion // Guardamos la relación para el render
    }));
});

// 2. Aplicamos el ordenamiento
const programasOrdenados = [...programasAplanados].sort((a, b) => {
    let valueA: string = "";
    let valueB: string = "";

  
    switch (sortField) {
      case "anio":
        valueA = String(a.anio);
        valueB = String(b.anio);
        break;
      case "estado":
        valueA = getProgramStateLabel(a.estado as ProgramaResponseDTOEstado);
        valueB = getProgramStateLabel(b.estado as ProgramaResponseDTOEstado);
        break;
      case "nombreMateria":
        valueA = a.materia?.nombre || "";
        valueB = b.materia?.nombre || "";
        break;
      case "profesorResponsable":
        valueA = a.profesorResponsable?.apellido || "";
        valueB = b.profesorResponsable?.apellido || "";
        break;
      case "carreraPlan":
        valueA = a.relacionEspecifica.carreraNombre || "";
        valueB = b.relacionEspecifica.carreraNombre || "";
        break;
      case "nombreDepartamento":
        valueA = a.materia?.departamento || "";
        valueB = b.materia?.departamento || "";
        break;
    }

    const comparison = valueA.localeCompare(valueB);
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="w-full bg-background">
      <div className="max-w-full mx-auto">
        {/* Search and Filters Section */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
        <div className="mb-4 flex md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por nombre, código, docente o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-border rounded-xl"
            />
          </div>
        </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Filter size={16} /> Carrera - Plan
              </label>
              <select
                value={filterCarreraPlan}
                onChange={(e) => setFilterCarreraPlan(e.target.value)}
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
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos los estados</option>
                {uniqueEstados.map((estado) => (
                  <option key={estado} value={estado || ""}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredAndSortedRows.length}</span> programa{filteredAndSortedRows.length === 1 ? "" : "s"}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-16">
                  <button
                    onClick={() => handleSort("anio")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Año
                    {sortField === "anio" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("nombreMateria")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Materia
                    {sortField === "nombreMateria" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("profesorResponsable")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Docente
                    {sortField === "profesorResponsable" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold w-1/4">
                  <button onClick={() => handleSort("carreraPlan")} className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                    Carrera - Plan {sortField === "carreraPlan" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("nombreDepartamento")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Departamento
                    {sortField === "nombreDepartamento" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("estado")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Estado
                    {sortField === "estado" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold w-40">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programasOrdenados.length > 0 ? (
                programasOrdenados.map((item) => {
                  const programa = item;
                  const relacion = item.relacionEspecifica;
                  
                  return (
                    <tr
                      key={programa.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-1.5">{programa.anio}</td>
                      <td className="px-3 py-1.5">
                        <div className="font-medium leading-tight">{programa.materia?.nombre}</div>
                        <div className="text-xs text-muted-foreground uppercase">{programa.materia?.codigo}</div>
                      </td>
                      <td className="px-3 py-1.5 text-xs">{programa.profesorResponsable?.apellido}, {programa.profesorResponsable?.nombre} (Legajo: {programa.profesorResponsable?.legajo})</td>
                      <td className="px-3 py-1.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary text-xs">{relacion.carreraNombre}</span>
                          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded w-fit mt-1">
                            Plan {relacion.plan?.anio} — v{relacion.plan?.version}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground">{programa.materia?.departamento}</td>
                      <td className="px-3 py-1.5">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${
                            getProgramStateStyles(programa.estado as ProgramaResponseDTOEstado) || "border-gray-300 bg-gray-50 text-gray-600"
                          }`}
                        >
                          {getProgramStateLabel(programa.estado as ProgramaResponseDTOEstado)}
                        </span> 
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => router.push(`/programas/${programa.id}`)}
                          className="border h-7 w-7 hover:bg-primary"
                          title="Ver Programa"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => router.push(`/programas/${programa.id}/historial-estados`)}
                          className="border h-7 w-7 hover:bg-primary"
                          title="Ver Historial de Estados"
                        >
                          <History size={16}/>
                        </Button>
                          {!esVistaVersiones && 
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => router.push(`/programas/materia/${programa.materia?.id}/versiones`)}
                              className="border h-7 w-7 hover:bg-primary"
                              title="Ver Versiones Anteriores"
                            >
                              <FolderClock size={16} />
                            </Button>
                          }
                          {(activeRole === "SECRETARIA" || activeRole === "DIRECCION_ADMINISTRATIVA" || activeRole === "SYSTEM_ADMIN") && programa.estado === "APROBADO_POR_SECRETARIA" && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleGenerarPDF(programa.id)}
                              className="border-2 hover:bg-primary hover:text-primary-foreground"
                            >
                              <>
                                <FileText size={16} className="mr-1" />
                                PDF
                              </>
                            </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="opacity-40" />
                      <p className="text-base">No se encontraron programas con los filtros seleccionados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
