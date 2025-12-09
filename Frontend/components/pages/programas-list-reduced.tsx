"use client"

import { useState } from "react"
import { Search, ChevronUp, ChevronDown} from "lucide-react"
import { ProgramaResponseDTO } from "@/app/api/generated/model"

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[],
  onRowClick: (programaId: number) => void;
}

type SortField = "nombreMateria" | "codigoMateria" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasListReduced({ programas = [], onRowClick }: ProgramasListProps) {
  const [sortField, setSortField] = useState<SortField>("nombreMateria")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

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
     {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{programas.length}</span> programas
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
              {programas.length > 0 ? (
                programas.map((programa) => (
                  <tr
                    key={programa.id}
                    className="hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-b-0"
                    onClick={() => onRowClick(programa.id!)}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{programa.nombreMateria}</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.codigoMateria}</td>
                    <td className="px-6 py-4 text-foreground/80">{programa.nombreDepartamento}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border-2`}
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
                      <p className="text-base">Sin programas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  )
}
