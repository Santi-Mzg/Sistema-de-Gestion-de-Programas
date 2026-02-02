"use client"

import { getListProgramasMateriaQueryKey, useListProgramasMateria } from "@/app/api/generated/client";
import { ProgramaResponseDTO } from "@/app/api/generated/model";
import { ProgramasList } from "@/components/pages/programas-list";
import { useParams } from "next/navigation";

export default function Programas() {
    const { id } = useParams<{ id: string }>()

  // props: {
  //   searchParams?: Promise<{
  //     search?: string;
  //     page?: string;
  //   }>;
  // }

  // const PROGRAMAS_PER_PAGE = 8
  // const searchParams = await props.searchParams;
  // const searchTerm = searchParams?.search || '';
  // const currentPage = Number(searchParams?.page) || 1;

  // const { programas, total } = await getProgramasByPage(currentPage, PRODUCTS_PER_PAGE, searchTerm)
  // const totalPages = Math.ceil(total / PROGRAMAS_PER_PAGE)


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

    const programas: ProgramaResponseDTO[] = programasQuery.data || [];

    // if (!activeDepartamento || !activeDepartamento.departamentoId || !activeRole) {
    //   return(
    //     <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
    //       <div className="text-center">
    //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
    //         <p className="text-yellow-700">Cargando datos de los programas...</p>
    //       </div>  
    //     </div>
    //   )
    // }

    // if (programasQuery.isLoading) {
    //   return (
    //       <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
    //           <div className="text-center">
    //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
    //               <p className="text-muted-foreground">Cargando datos de los programas...</p>
    //           </div>
    //       </div>
    //   )
    // }

    // if (programasQuery.error) {
    //   return (
    //     <div className="p-8 max-w-7xl mx-auto">
    //       <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    //         <AlertCircle className="text-red-600" size={24} />
    //         <p className="text-red-700">Error al obtener los programas</p>
    //       </div>
    //     </div>
    //   )
    // }


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

        // if (programasQuery.error) {
    //   return (
    //     <div className="p-8 max-w-7xl mx-auto">
    //       <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    //         <AlertCircle className="text-red-600" size={24} />
    //         <p className="text-red-700">Error al obtener los programas</p>
    //       </div>
    //     </div>
    //   )
    // }

    return (
      <ProgramasList programas={programas} />
      // <ProgramasList programas={programas} totalPages={totalPages} />
    );
}
