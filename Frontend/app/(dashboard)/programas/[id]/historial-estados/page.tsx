"use client"

import { getGetProgramaQueryKey } from "@/app/api/generated/client";
import { useGetPrograma } from "@/app/api/generated/client";
import { ProgramaResponseDTOEstado } from "@/app/api/generated/model";
import { ProgramaResponseDTO } from "@/app/api/generated/model/programaResponseDTO";
import { EstadoHistorialFlow } from "@/components/pages/historial-estados-flow";
import { useHeader } from "@/context/header-context";
import { useRole } from "@/context/role-context";
import { getProgramStateLabel } from "@/lib/utils";
import { AlertCircle, History, Orbit } from "lucide-react";
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
      title: programa ? `Historial de Estados de ${programa?.materia?.nombre} (${programa?.materia?.codigo}) - Año ${programa?.anio}` : "Nuevo Programa Académico",
      subtitle: "Historial de estados de programa académico",
      badge: (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <Orbit className="text-primary" size={18} />
          <span className="font-semibold text-primary">{getProgramStateLabel(programa?.estado as ProgramaResponseDTOEstado)}</span>
        </div>
      ),
      icon: History
    })
  }, [programa]);

  if (!activeRole || programaQuery.isLoading) {
    return(
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-yellow-700">Cargando...</p>
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
      <EstadoHistorialFlow historial={programa?.historialEstados} />
    );
}
