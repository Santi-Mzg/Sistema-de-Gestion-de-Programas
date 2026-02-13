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

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[]
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type SortField = "anio" | "nombreMateria" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasList({ programas = [] }: ProgramasListProps) {
  const { setHeader } = useHeader()
  const { activeRole } = useRole()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("nombreMateria")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [filterEstado, setFilterEstado] = useState<string>("todos")

  const pathname = usePathname() // 2. Obtener la ruta actual
  const esVistaVersiones = pathname.includes("/versiones")
  const actualYear = new Date().getFullYear()
  
  useEffect(() => {
    if(esVistaVersiones && programas.length > 0) 
        setHeader({
          title: `Versiones del Programa de ${programas[0]?.materia?.nombre}`,
          subtitle: "Consulta las versiones anteriores del programa seleccionado",
          icon: FolderClock,
        })
    else
        setHeader({
          title: `Programas - ${actualYear}`,
          subtitle: "Gestiona y consulta los programas disponibles",
          icon: FileText,
        })
  }, [])

  // Get unique values for filters
  const uniqueEstados = useMemo(() => {
    return [...new Set(programas.map((s) => getProgramStateLabel(s.estado as ProgramaResponseDTOEstado)).filter(Boolean))]
  }, [programas])


  // Filter and sort data
  const filteredAndSortedSyllabuses = useMemo(() => {
    const filtered = programas.filter((programa) => {
      const matchesSearch =
        !searchTerm ||
        programa.materia?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.materia?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.profesorResponsable?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.profesorResponsable?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.profesorResponsable?.legajo?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesEstado = filterEstado === "todos" || getProgramStateLabel(programa.estado as ProgramaResponseDTOEstado) === filterEstado

      return matchesSearch && matchesEstado
    })

    const getSortValue = (programa: ProgramaResponseDTO, field: SortField): string => {
      switch (field) {
        case "anio":
          return String(programa.anio ?? "")

        case "nombreMateria":
          return programa.materia?.nombre ?? ""

        case "profesorResponsable":
          return programa.profesorResponsable
            ? `${programa.profesorResponsable.apellido} ${programa.profesorResponsable.nombre}`
            : ""

        case "nombreDepartamento":
          return programa.materia?.departamento ?? ""

        case "estado":
          return getProgramStateLabel(programa.estado as ProgramaResponseDTOEstado) ?? ""

        default:
          return ""
      }
    }

    filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortField)
      const bValue = getSortValue(b, sortField)

      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return filtered
  }, [programas, searchTerm, sortField, sortOrder, filterEstado])

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
    const baseUrl = window.location.origin;
  
    const pdfUrl = `${baseUrl}/api-proxy/api/programas/${programaId}/pdf`;
      
    window.open(pdfUrl, "_blank");
  }

  return (
    <div className="w-full bg-background">
      <div className="max-w-full mx-auto">
        {/* Search and Filters Section */}
          {/* Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-muted/30 p-3 rounded-lg border">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar por nombre, código, docente o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm rounded-md" // h-9 para hacerlo más bajo
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter size={16} />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="h-9 px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="todos">Todos los estados</option>
              {uniqueEstados.map((estado) => (
                <option key={estado} value={estado || ""}>{estado}</option>
              ))}
            </select>

            {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
              activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
              <Button size="sm" onClick={() => router.push(`/programas/crear`)} className="h-9">
                <Plus size={16} className="mr-1" /> Nuevo Programa
              </Button>
            }
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredAndSortedSyllabuses.length}</span> de {" "}
          <span className="font-semibold text-foreground">{programas.length}</span> programa{programas.length === 1 ? "" : "s"}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
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
                {activeRole !== UsuarioDepartamentoDTORolesItem.DOCENTE &&
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
                }
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("nombreDepartamento")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Departamento
                    {sortField === "nombreDepartamento" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("estado")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
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
              {filteredAndSortedSyllabuses.length > 0 ? (
                filteredAndSortedSyllabuses.map((programa) => (
                  <tr
                    key={programa.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-1.5">{programa.anio}</td>
                    <td className="px-3 py-1.5">
                      <div className="font-medium leading-tight">{programa.materia?.nombre}</div>
                      <div className="text-xs text-muted-foreground uppercase">{programa.materia?.codigo}</div>
                    </td>
                    {activeRole !== UsuarioDepartamentoDTORolesItem.DOCENTE &&
                      <td className="px-3 py-1.5 text-xs">{programa.profesorResponsable?.apellido}, {programa.profesorResponsable?.nombre} (Legajo: {programa.profesorResponsable?.legajo})</td>
                    }
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">{programa.materia?.departamento}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${
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
                            className="border h-7 w-7 hover:bg-primary"
                            title="Generar PDF"
                          >
                            <FileText size={16} />
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
                      <p className="text-base">No se encontraron Programas con los filtros seleccionados</p>
                      {(activeRole === "ADMINISTRACION" || activeRole === "SYSTEM_ADMIN") && (
                        <Link href="/programas/crear">
                          <Button>Crear Programa</Button>
                        </Link>
                      )}
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
