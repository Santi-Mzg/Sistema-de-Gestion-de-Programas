"use client"

import { useListCarrerasDepartamento } from "@/app/api/generated/client";
import { CarreraResponseDTO } from "@/app/api/generated/model";
import { CarrerasList } from "@/components/pages/carreras-list";
import { Button } from "@/components/ui/button";
import { useDept } from "@/context/dept-context";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Carreras() {
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

    const carrerasQuery = useListCarrerasDepartamento(activeDepartamento?.departamentoId);
    const carreras: CarreraResponseDTO[] | undefined = carrerasQuery.data;

    if (carrerasQuery.isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando datos de las carreras...</p>
                </div>
            </div>
        )
    }

    if (carrerasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las carreras</p>
          </div>
        </div>
      )
    }


    return (
      <CarrerasList carreras={carreras} />
    )
}
