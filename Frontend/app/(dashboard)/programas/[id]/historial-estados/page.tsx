"use client"

import { getGetProgramaQueryKey } from "@/app/api/generated/client";
import { useGetPrograma } from "@/app/api/generated/client";
import { ProgramaResponseDTO } from "@/app/api/generated/model/programaResponseDTO";
import { EstadoHistorialFlow } from "@/components/pages/historial-estados-flow";
import { useHeader } from "@/context/header-context";
import { useRole } from "@/context/role-context";
import { cn, getProgramStateLabel, getProgramStateStyles } from "@/lib/utils";
import { AlertCircle, History } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";

  

export default function HistorialEstado() {
  const { activeRole } = useRole()
  const { id } = useParams<{ id: string }>()

  const {setHeader} = useHeader();

  const programaQuery = useGetPrograma(Number(id),
    {
      query: {
        staleTime: 0,
        queryKey: getGetProgramaQueryKey(Number(id))
      }
    }
  );
  const programa: ProgramaResponseDTO | undefined = programaQuery.data;

  useEffect(() => {
    setHeader({
      title: programa ? `Historial de estados de ${programa.materia?.nombre} (${programa.materia?.codigo}) - Año ${programa.anio}` : "Historial de estados",
      subtitle: "Intervenciones y devoluciones del programa en orden cronológico",
      badge: (
        programa?.estado ? <span className={cn(
          "inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs font-semibold",
          getProgramStateStyles(programa.estado),
        )}>
          {getProgramStateLabel(programa.estado)}
        </span> : undefined
      ),
      icon: History
    })
  }, [programa]);

  if (!activeRole || programaQuery.isLoading) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando historial de estados...</p>
        </div>
      </div>
    )
  }

  if (!programa || !programa.historialEstados || programa.historialEstados.length === 0) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mb-2 text-yellow-700" />
          <p className="text-yellow-700">No hay historial de estados disponible para el programa</p>
        </div>
      </div>
    )
  }

    return (
      <div className="mx-auto w-full max-w-5xl pb-6">
        <EstadoHistorialFlow historial={programa.historialEstados} />
      </div>
    );
}
