"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Eye } from "lucide-react"
import { ProgramaResponseDTO } from "@/app/api/generated/model"
import { useDept } from "@/context/dept-context";
import { useRouter } from "next/navigation"
import { Button } from "../ui/button";

interface ProgramasListProps {
  programas?: ProgramaResponseDTO[],
}

type SortField = "materia" | "carreraPlan" | "nombreDepartamento" | "profesorResponsable"
type SortOrder = "asc" | "desc"

export function ProgramasListReducedCoord({ programas = [] }: ProgramasListProps) {
  const { activeDepartamento } = useDept();
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("materia")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field); setSortOrder("asc")
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
    case "materia":
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
      <div className="mb-2 text-sm text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{programas.length}</span> programa{programas.length === 1 ? "" : "s"}
      </div>

      <div className="overflow-x-auto border-2 border-border rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="px-3 py-1.5 text-left w-1/4">
                <button onClick={() => handleSort("materia")} className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                  Materia {sortField === "materia" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </button>
              </th>
              <th className="px-3 py-1.5 text-left w-1/4">
                <button
                  onClick={() => handleSort("profesorResponsable")}
                  className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
                >
                  Docente
                  {sortField === "profesorResponsable" &&
                    (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </button>
              </th>
              <th className="px-3 py-1.5 text-left w-1/4">
                <button onClick={() => handleSort("carreraPlan")} className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                  Carrera - Plan {sortField === "carreraPlan" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </button>
              </th>
              <th className="px-3 py-1.5 text-left">
                <button onClick={() => handleSort("nombreDepartamento")} className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                  Departamento {sortField === "nombreDepartamento" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </button>
              </th>
              <th className="px-3 py-1.5 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {programasOrdenados.length > 0 ? (
              programasOrdenados.map((item) => {
                const programa = item;
                const relacion = item.relacionEspecifica;

                return (
                  <tr key={`${programa.id}-${relacion.plan?.id}`} className="transition-colors border-b border-border last:border-0">
                    <td className="px-3 py-1.5">
                      <div className="font-medium text-foreground">{programa.materia?.nombre}</div>
                      <div className="text-xs text-muted-foreground">{programa.materia?.codigo}</div>
                    </td>

                    <td className="px-3 py-1.5 text-foreground/80">{programa.profesorResponsable?.apellido}, {programa.profesorResponsable?.nombre} (Legajo: {programa.profesorResponsable?.legajo})</td>

                    <td className="px-3 py-1.5 align-middle">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary text-sm">{relacion.carreraNombre}</span>
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded w-fit mt-1">
                          Plan {relacion.plan?.anio} — Versión {relacion.plan?.version}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-1.5 align-middle">
                      <span className="text-sm font-medium text-foreground/80">
                        {programa.materia?.departamento || "N/A"}
                      </span>
                    </td>

                    <td className="px-3 py-1.5 align-middle text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/programas/${programa.id}/revision/comision/${relacion.plan?.id}`)}
                        className="border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Eye size={16} className="mr-2" />
                        Revisar
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                  No hay programas pendientes de revisión.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}