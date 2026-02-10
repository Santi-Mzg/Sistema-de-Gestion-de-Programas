"use client"

import { act, useState } from "react"
import { Search, ChevronUp, ChevronDown, Eye, Pencil} from "lucide-react"
import { ProgramaResponseDTO, ProgramaResponseDTOEstado, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button";
import { useRole } from "@/context/role-context";
import { getProgramStateLabel, getProgramStateStyles } from "@/lib/utils";

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[],
  onRowClick: (programaId: number) => void;
}

type SortField = "materia" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasListReduced({ programas = [], onRowClick }: ProgramasListProps) {
  const { activeRole } = useRole();
  const [sortField, setSortField] = useState<SortField>("materia")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const programasOrdenados = programas.sort((a, b) => {
  let valueA: string = "";
  let valueB: string = "";

  switch (sortField) {
    case "materia":
      valueA = a.materia?.nombre || "";
      valueB = b.materia?.nombre || "";
      break;
    case "profesorResponsable":
      valueA = a.profesorResponsable?.apellido || "";
      valueB = b.profesorResponsable?.apellido || "";
      break;
    case "estado":
      valueA = getProgramStateLabel(a.estado as ProgramaResponseDTOEstado);
      valueB = getProgramStateLabel(b.estado as ProgramaResponseDTOEstado);
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
     {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{programasOrdenados.length}</span> programa{programasOrdenados.length === 1 ? "" : "s"}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-2 border-border rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("materia")}
                    className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Materia
                    {sortField === "materia" &&
                      (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                  </button>
                </th>
                {activeRole !== UsuarioDepartamentoDTORolesItem.DOCENTE &&
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("profesorResponsable")}
                      className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                    >
                      Docente
                      {sortField === "profesorResponsable" &&
                        (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </button>
                  </th>
                }
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
                <th className="px-6 py-4 text-left">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programas.length > 0 ? (
                programas.map((programa) => (
                  <tr
                    key={programa.id}
                    className="transition-colors border-b border-border last:border-b-0"
                    onClick={() => onRowClick(programa.id!)}
                  >
                    <td className="px-6 py-4 align-middle">
                      <div className="font-medium text-foreground">{programa.materia?.nombre}</div>
                      <div className="text-xs text-muted-foreground">{programa.materia?.codigo}</div>
                    </td>
                    {activeRole !== UsuarioDepartamentoDTORolesItem.DOCENTE &&
                      <td className="px-6 py-4 text-foreground/80">{programa.profesorResponsable?.apellido}, {programa.profesorResponsable?.nombre} (Legajo: {programa.profesorResponsable?.legajo})</td>
                    }
                    <td className="px-6 py-4 align-middle">
                      <span className="text-sm font-medium text-foreground/80">
                        {programa.materia?.departamento || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${
                          getProgramStateStyles(programa.estado as ProgramaResponseDTOEstado) || "border-gray-300 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {getProgramStateLabel(programa.estado as ProgramaResponseDTOEstado)}
                      </span> 
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRowClick(programa.id!)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          {activeRole === "SECRETARIA" ? (
                            <>
                              <Eye size={16} className="mr-1" />
                              Revisar
                            </>
                          ) : (
                            <>
                              <Pencil size={16} className="mr-1" />
                              Completar
                            </>
                          )}
                        </Button>
                      </div>
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
