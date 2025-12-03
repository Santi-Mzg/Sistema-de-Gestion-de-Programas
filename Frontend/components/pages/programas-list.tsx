"use client"

import { useState, useMemo } from "react"
import { Search, ChevronUp, ChevronDown, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProgramaResponseDTO } from "@/app/api/generated/model"

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[]
}

type SortField = "nombreMateria" | "codigoMateria" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasList({ programas = [] }: ProgramasListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("nombreMateria")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterProfesor, setFilterProfesor] = useState<string>("todos")
  const [filterDepartamento, setFilterDepartamento] = useState<string>("todos")

  const mockSyllabuses: ProgramaResponseDTO[] = [
    {
      id: 1,
      nombreMateria: "Cálculo I",
      codigoMateria: "MAT101",
      nombreDepartamento: "Matemática",
      profesorResponsable: "Dr. Juan Pérez",
      estado: "publicado",
      creditos: 4,
      cargaHorariaTotal: 64,
      cargaHorariaSemanal: 4,
    },
    {
      id: 2,
      nombreMateria: "Física General",
      codigoMateria: "FIS102",
      nombreDepartamento: "Física",
      profesorResponsable: "Dra. María García",
      estado: "borrador",
      creditos: 5,
      cargaHorariaTotal: 80,
      cargaHorariaSemanal: 5,
    },
    {
      id: 3,
      nombreMateria: "Programación I",
      codigoMateria: "CS101",
      nombreDepartamento: "Informática",
      profesorResponsable: "Ing. Carlos López",
      estado: "publicado",
      creditos: 4,
      cargaHorariaTotal: 64,
      cargaHorariaSemanal: 4,
    },
    {
      id: 4,
      nombreMateria: "Álgebra Lineal",
      codigoMateria: "MAT201",
      nombreDepartamento: "Matemática",
      profesorResponsable: "Dr. Juan Pérez",
      estado: "en revision",
      creditos: 4,
      cargaHorariaTotal: 64,
      cargaHorariaSemanal: 4,
    },
    {
      id: 5,
      nombreMateria: "Base de Datos",
      codigoMateria: "CS201",
      nombreDepartamento: "Informática",
      profesorResponsable: "Ing. Ana Martínez",
      estado: "publicado",
      creditos: 4,
      cargaHorariaTotal: 64,
      cargaHorariaSemanal: 4,
    },
  ]

  // const dataTouse = programas && programas.length > 0 ? programas : mockSyllabuses
  const dataTouse = mockSyllabuses
  

  // Get unique values for filters
  const uniqueEstados = useMemo(() => {
    return [...new Set(dataTouse.map((s) => s.estado).filter(Boolean))]
  }, [dataTouse])

  const uniqueProfesores = useMemo(() => {
    return [...new Set(dataTouse.map((s) => s.profesorResponsable).filter(Boolean))]
  }, [dataTouse])

  const uniqueDepartamentos = useMemo(() => {
    return [...new Set(dataTouse.map((s) => s.nombreDepartamento).filter(Boolean))]
  }, [dataTouse])

  // Filter and sort data
  const filteredAndSortedSyllabuses = useMemo(() => {
    const filtered = dataTouse.filter((programa) => {
      const matchesSearch =
        !searchTerm ||
        programa.nombreMateria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.codigoMateria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.profesorResponsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.nombreDepartamento?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesEstado = filterEstado === "todos" || programa.estado === filterEstado
      const matchesProfesor = filterProfesor === "todos" || programa.profesorResponsable === filterProfesor
      const matchesDepartamento = filterDepartamento === "todos" || programa.nombreDepartamento === filterDepartamento

      return matchesSearch && matchesEstado && matchesProfesor && matchesDepartamento
    })

    filtered.sort((a, b) => {
      const aValue = String((a as any)[sortField] ?? "")
      const bValue = String((b as any)[sortField] ?? "")

      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })

    return filtered
  }, [dataTouse, searchTerm, sortField, sortOrder, filterEstado, filterProfesor, filterDepartamento])

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
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por nombre, código, profesor o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-border rounded-xl"
            />
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
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
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Filter size={16} /> Profesor
              </label>
              <select
                value={filterProfesor}
                onChange={(e) => setFilterProfesor(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos los profesores</option>
                {uniqueProfesores.map((profesor) => (
                  <option key={profesor} value={profesor || ""}>
                    {profesor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Filter size={16} /> Departamento
              </label>
              <select
                value={filterDepartamento}
                onChange={(e) => setFilterDepartamento(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos los departamentos</option>
                {uniqueDepartamentos.map((departamento) => (
                  <option key={departamento} value={departamento || ""}>
                    {departamento}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredAndSortedSyllabuses.length}</span> de{" "}
          <span className="font-semibold text-foreground">{dataTouse.length}</span> programa
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
                    <td className="px-6 py-4 font-medium text-foreground">{programa.nombreMateria}</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.codigoMateria}</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.profesorResponsable}</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.nombreDepartamento}</td>
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
