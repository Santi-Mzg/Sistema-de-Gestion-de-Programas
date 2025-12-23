"use client"

import { useListMateriasDepartamento } from "@/app/api/generated/client";
import { MateriaResponseDTO } from "@/app/api/generated/model";
import { MateriasList } from "@/components/pages/materias-list";
import { Button } from "@/components/ui/button";
import { useDept } from "@/context/dept-context";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Materias() {
    const { activeDepartamento, isLoading } = useDept()

    const materiasQuery = useListMateriasDepartamento(activeDepartamento?.departamentoId ?? 0, 
      {
        query: {
          enabled: !!activeDepartamento?.departamentoId,
          queryKey: useListMateriasDepartamento(activeDepartamento?.departamentoId ?? 0).queryKey
        }
      }
    );
    const materias: MateriaResponseDTO[] | undefined = materiasQuery.data;


    if (!activeDepartamento || !activeDepartamento.departamentoId) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando datos de las materias...</p>
          </div>
        </div>
      )
    }

    if (materiasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de las materias...</p>
                </div>
            </div>
        )
    }

    if (materiasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las materias</p>
          </div>
        </div>
      )
    }

    return (
      <MateriasList materias={materias} />
    )
}
