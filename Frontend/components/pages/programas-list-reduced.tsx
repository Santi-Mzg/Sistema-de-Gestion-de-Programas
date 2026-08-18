"use client"

import { act, useState } from "react"
import { Search, ChevronUp, ChevronDown, Eye, Pencil, Clock, AlertCircle} from "lucide-react"
import { ProgramaResponseDTOEstado, ProgramaResponseReducedDTO, UserCreateDTORolesItem, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { Button } from "../ui/button";
import { useRole } from "@/context/role-context";
import { getProgramStateLabel, getProgramStateStyles } from "@/lib/utils";
import { PageNavigation } from "../nav/page-nav";

interface ProgramasListProps {
  programas?: ProgramaResponseReducedDTO[]
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onRowClick: (programaId: number) => void;
}

type SortField = "materia" | "estado" | "profesorResponsable" | "nombreDepartamento"
type SortOrder = "asc" | "desc"

export function ProgramasListReduced({ 
  programas = [],
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,  
  onRowClick
}: ProgramasListProps) {
  const { activeRole } = useRole();
  const [sortField, setSortField] = useState<SortField>("estado")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

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
            {programas.length > 0 && (
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
            )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">
                  <button
                    onClick={() => handleSort("materia")}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    Materia
                    {sortField === "materia" &&
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
              {programas.length > 0 ? (
                programas.map((programa) => (
                  <tr
                    key={programa.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-1.5">
                      <div className="font-medium leading-tight">{programa.materia?.nombre}</div>
                      <div className="text-xs text-muted-foreground uppercase">{programa.materia?.codigo}</div>
                    </td>
                    {activeRole !== UsuarioDepartamentoDTORolesItem.DOCENTE &&
                      <td className="px-3 py-1.5 test-xs text-muted-foreground">{programa.profesorResponsable?.apellido}, {programa.profesorResponsable?.nombre} (Legajo: {programa.profesorResponsable?.legajo})</td>
                    }
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">
                        {programa.materia?.departamento || "N/A"}
                    </td>
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
                          size="sm"
                          variant="outline"
                          onClick={() => onRowClick(programa.id!)}
                          className="border-2 hover:bg-primary hover:text-primary-foreground"
                        >
                          {activeRole === UserCreateDTORolesItem.SECRETARIA || activeRole === UserCreateDTORolesItem.COORDINACION_COMISION_CURRICULAR ? (
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
                      <p className="text-base">Sin programas pendientes</p>
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
  )
}
