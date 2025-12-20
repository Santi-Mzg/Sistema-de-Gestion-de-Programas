"use client"

import { useListAreasDepartamento } from "@/app/api/generated/client";
import { AreaResponseDTO } from "@/app/api/generated/model";
import { AreasList } from "@/components/pages/areas-list";
import { Button } from "@/components/ui/button";
import { useDept } from "@/context/dept-context";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Areas() {
    const { activeDepartamento } = useDept()

    if (!activeDepartamento || !activeDepartamento.departamentoId) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando departamento...</p>
          </div>
        </div>
      )
    }

    const areasQuery = useListAreasDepartamento(activeDepartamento?.departamentoId);
    const areas: AreaResponseDTO[] | undefined = areasQuery.data;

    if (areasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de las áreas...</p>
                </div>
            </div>
        )
    }

    if (areasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las áreas</p>
          </div>
        </div>
      )
    }


    return (
      <AreasList areas={areas} />
    )
}
