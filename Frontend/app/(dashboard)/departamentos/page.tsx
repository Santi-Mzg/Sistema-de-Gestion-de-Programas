"use client";

import { getListDepartamentosQueryKey, useListDepartamentos } from "@/app/api/generated/client";
import { DepartamentoResponseDTO } from "@/app/api/generated/model";
import { DepartamentosList } from "@/components/pages/departamentos-list"
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Departamentos() {
  const departamentosQuery = useListDepartamentos(
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getListDepartamentosQueryKey()
      }
    }
  );
  const departamentos: DepartamentoResponseDTO[] | undefined = departamentosQuery.data;

  if (departamentosQuery.isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos de los departamentos...</p>
        </div>
      </div>
    )
  }

  if (departamentosQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener los departamentos</p>
        </div>
      </div>
    )
  }
  
    return (
      <DepartamentosList departamentos={departamentos} />
    )
}
