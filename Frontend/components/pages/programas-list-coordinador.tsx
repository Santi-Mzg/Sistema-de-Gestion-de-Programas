"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Eye, FileText, History, FolderClock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProgramaResponseDTO, ProgramaResponseDTOEstado } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useHeader } from "@/context/header-context"
import { getProgramStateLabel, getProgramStateStyles } from "@/lib/utils"
import { useDept } from "@/context/dept-context"
import { PageNavigation } from "../nav/page-nav"

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  filterCarreraPlan: string
  onPageChange: (page: number) => void
}

type SortField = "anio" | "nombreMateria" | "carreraPlan" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasListCoordinador({
    programas = [],
    page,
    pageSize,
    totalPages,
    totalElements,
    filterCarreraPlan,
    onPageChange,
  }: ProgramasListProps) {
  const { setHeader } = useHeader()
  const { activeDepartamento } = useDept()
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>("nombreMateria")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const pathname = usePathname()
  const esVistaVersiones = pathname.includes("/versiones")

  
  useEffect(() => {
    setHeader({
      title: `Programas`,
      subtitle: "Gestiona y consulta los programas disponibles",
      icon: FileText,
    })
  }, [])

  // Filter and sort data
  const rowsDisplay = useMemo(() => {
    const flattened = programas.flatMap((programa) => {
      const relaciones = programa.bloqueMultiple?.filter((relacion) => {
        const carreraNombre = relacion.carreraNombre

        if (!carreraNombre) {
          return false
        }

        // Solo carreras de las que este usuario es coordinador
        const esCarreraCoordinada =
          activeDepartamento?.carrerasComoComision?.includes(carreraNombre)

        if (!esCarreraCoordinada) {
          return false
        }

        // Si seleccionó una carrera específica, mostramos solo esa
        if (
          filterCarreraPlan !== "todos" &&
          carreraNombre !== filterCarreraPlan
        ) {
          return false
        }

        return true
      }) ?? []

      return relaciones.map((relacion) => ({
        ...programa,
        relacionEspecifica: relacion,
      }))
    })

    return [...flattened].sort((a, b) => {
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
  }, [
    programas,
    sortField,
    sortOrder,
    filterCarreraPlan,
    activeDepartamento?.carrerasComoComision,
  ])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <div className="w-full bg-background">
      <div className="max-w-full mx-auto">
        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          <span>
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {page * pageSize + 1}
            </span>
            {" – "}
            <span className="font-medium text-foreground">
              {Math.min((page + 1) * pageSize, totalElements)}
            </span>
            {" de "}
            <span className="font-medium text-foreground">
              {totalElements}
            </span>{" "}
            programas
          </span>
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
          <PageNavigation 
            page={page}   
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={onPageChange}
            itemLabel = "programas"
          />
        </div>
      </div>
    </div>
  )
}
