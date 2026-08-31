"use client"

import { getListProgramasMateriaQueryKey, useListProgramasMateria } from "@/app/api/generated/client";
import { ProgramaResponseReducedDTO } from "@/app/api/generated/model";
import { ProgramasList } from "@/components/pages/programas-list";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Programas() {
    const { id } = useParams<{ id: string }>()
    const [page, setPage] = useState(0)
    const pageSize = 10

    const programasQuery = useListProgramasMateria(
        Number(id),
        {
          query: {
            enabled: !!id,
            staleTime: 1000 * 60 * 5,
            queryKey: getListProgramasMateriaQueryKey(Number(id)),
          },
        }
    );

    const programas: ProgramaResponseReducedDTO[] = programasQuery.data || [];


    const isReady = !!id && programasQuery.isSuccess;

    if (!isReady) {
      // return <LoadingSpinner text="Cargando datos de los programas..." />
      return (
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando programas...</p>
          </div>  
        </div>
      )
    }


    return (
      <ProgramasList 
        programas={programas} 
        page={page}
        pageSize={pageSize}
        totalPages={1}
        totalElements={programas.length}
        esVistaVersiones={true}
        onPageChange={setPage} 
      />
    );
}
