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
 const rowsDisplay = useMemo(() => {
    // 1. Aplanar: Una fila por cada relación materia-carrera que el coordinador supervisa
    const flattened = programas.flatMap((programa) => {
      const planesAsignados = programa.bloqueMultiple?.filter(b => 
        activeDepartamento?.carrerasComoComision?.includes(b.carreraNombre!)
      ) || [];
      
      return planesAsignados.map(relacion => ({
        ...programa,
        relacionEspecifica: relacion 
      }));
    });

    // 2. Filtrar
    const filtered = flattened.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.materia?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materia?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profesorResponsable?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.profesorResponsable?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstado =
        filterEstado === "todos" ||
        getProgramStateLabel(item.estado as ProgramaResponseDTOEstado) === filterEstado;

      const matchesCarreraPlan =
        filterCarreraPlan === "todos" ||
        item.relacionEspecifica.carreraNombre === filterCarreraPlan;

      return matchesSearch && matchesEstado && matchesCarreraPlan;
    });

    // 3. Ordenar
    return [...filtered].sort((a, b) => {
      let valueA: string = "";
      let valueB: string = "";

      switch (sortField) {
        case "anio": valueA = String(a.anio); valueB = String(b.anio); break;
        case "estado":
          valueA = getProgramStateLabel(a.estado as ProgramaResponseDTOEstado);
          valueB = getProgramStateLabel(b.estado as ProgramaResponseDTOEstado);
          break;
        case "nombreMateria": valueA = a.materia?.nombre || ""; valueB = b.materia?.nombre || ""; break;
        case "profesorResponsable": valueA = a.profesorResponsable?.apellido || ""; valueB = b.profesorResponsable?.apellido || ""; break;
        case "carreraPlan": valueA = a.relacionEspecifica.carreraNombre || ""; valueB = b.relacionEspecifica.carreraNombre || ""; break;
        case "nombreDepartamento": valueA = a.materia?.departamento || ""; valueB = b.materia?.departamento || ""; break;
      }

      const comparison = valueA.localeCompare(valueB);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [programas, searchTerm, sortField, sortOrder, filterEstado, filterCarreraPlan, activeDepartamento]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
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
          Mostrando <span className="font-semibold text-foreground">{rowsDisplay.length}</span> programa{rowsDisplay.length === 1 ? "" : "s"}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                {[
                  { id: "anio", label: "Año" },
                  { id: "nombreMateria", label: "Materia" },
                  { id: "profesorResponsable", label: "Docente" },
                  { id: "carreraPlan", label: "Carrera - Plan" },
                  { id: "nombreDepartamento", label: "Departamento" },
                  { id: "estado", label: "Estado" }
                ].map((col) => (
                  <th key={col.id} className="px-3 py-3 text-left font-semibold">
                    <button
                      onClick={() => handleSort(col.id as SortField)}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      {col.label}
                      {sortField === col.id && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rowsDisplay.length > 0 ? (
                rowsDisplay.map((item) => (
                  <tr key={`${item.id}-${item.relacionEspecifica.plan?.id}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2">{item.anio}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium leading-tight">{item.materia?.nombre}</div>
                      <div className="text-xs text-muted-foreground uppercase">{item.materia?.codigo}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {item.profesorResponsable?.apellido}, {item.profesorResponsable?.nombre} (Legajo: {item.profesorResponsable?.legajo})
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary text-xs">{item.relacionEspecifica.carreraNombre}</span>
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded w-fit mt-1">
                          Plan {item.relacionEspecifica.plan?.anio} — v{item.relacionEspecifica.plan?.version}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{item.materia?.departamento}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${getProgramStateStyles(item.estado as ProgramaResponseDTOEstado)}`}>
                        {getProgramStateLabel(item.estado as ProgramaResponseDTOEstado)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => router.push(`/programas/${item.id}`)} title="Ver Programa">
                          <Eye size={16} />
                        </Button>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => router.push(`/programas/${item.id}/historial-estados`)} title="Historial">
                          <History size={16}/>
                        </Button>
                        {!esVistaVersiones && (
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => router.push(`/programas/materia/${item.materia?.id}/versiones`)} title="Versiones">
                            <FolderClock size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
