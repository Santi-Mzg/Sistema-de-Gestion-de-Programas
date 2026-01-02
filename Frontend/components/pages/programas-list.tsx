"use client"

import { useState, useMemo } from "react"
import { Search, ChevronUp, ChevronDown, Filter, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useRole } from "@/context/role-context"
import Link from "next/link"

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[]
}

type SortField = "nombreMateria" | "codigoMateria" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasList({ programas = [] }: ProgramasListProps) {
  const { activeRole } = useRole()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("nombreMateria")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterProfesor, setFilterProfesor] = useState<string>("todos")
  const [filterDepartamento, setFilterDepartamento] = useState<string>("todos")

  
  // Get unique values for filters
  const uniqueEstados = useMemo(() => {
    return [...new Set(programas.map((s) => s.estado).filter(Boolean))]
  }, [programas])

  const uniqueProfesores = useMemo(() => {
    return [...new Set(programas.map((s) => s.profesorResponsable).filter(Boolean))]
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

      const matchesEstado = filterEstado === "todos" || programa.estado === filterEstado
      const matchesProfesor = filterProfesor === "todos" || programa.profesorResponsable === filterProfesor

      return matchesSearch && matchesEstado && matchesProfesor
    })

    filtered.sort((a, b) => {
      const aValue = String((a as any)[sortField] ?? "")
      const bValue = String((b as any)[sortField] ?? "")

      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })

    return filtered
  }, [programas, searchTerm, sortField, sortOrder, filterEstado, filterProfesor, filterDepartamento])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case "publicado":
        return "bg-green-100 text-green-800 border-green-300"
      case "borrador":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "en revision":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "archivado":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-8 rounded-b-2xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Programas Universitarios</h1>
        <p className="text-primary-foreground/80">Gestiona y consulta todos los programa del sistema</p>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Search and Filters Section */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
        <div className="mb-8 flex md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por nombre, código, profesor o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-border rounded-xl"
            />
          </div>
          {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
              activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
            <Button size="lg"
                    variant="outline"
                    onClick={() => router.push(`/programas/cargar`)}
                    className="border-2 hover:bg-primary hover:text-primary-foreground">
              <Plus size={16} className="mr-1" />
              Cargar Nuevo Programa
            </Button>
          }
        </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                <Filter size={16} /> Profesor
              </label>
              <select
                value={filterProfesor}
                onChange={(e) => setFilterProfesor(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos los profesores</option>
                {uniqueProfesores.map((profesor) => (
                  <option key={profesor?.id} value={profesor?.id || ""}>
                    {profesor?.apellido}, {profesor?.nombre} (Legajo: {profesor?.legajo})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredAndSortedSyllabuses.length}</span> de{" "}
          <span className="font-semibold text-foreground">{programas.length}</span> programa
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-2 border-border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("nombreMateria")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Materia
                    {sortField === "nombreMateria" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("codigoMateria")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Código
                    {sortField === "codigoMateria" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("profesorResponsable")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Profesor
                    {sortField === "profesorResponsable" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("nombreDepartamento")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Departamento
                    {sortField === "nombreDepartamento" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("estado")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Estado
                    {sortField === "estado" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedSyllabuses.length > 0 ? (
                filteredAndSortedSyllabuses.map((programa) => (
                  <tr
                    key={programa.id}
                    className="hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{programa.materia?.nombre}</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.materia?.codigo}</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.profesorResponsable?.apellido}, {programa.profesorResponsable?.nombre} (Legajo: {programa.profesorResponsable?.legajo})</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.materia?.departamento}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${getEstadoColor(
                          programa.estado,
                        )}`}
                      >
                        {programa.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="opacity-40" />
                      <p className="text-base">No se encontraron Programas con los filtros seleccionados</p>
                      <Link href="/programas/cargar">
                        <Button>Cargar Programa</Button>
                      </Link>
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
