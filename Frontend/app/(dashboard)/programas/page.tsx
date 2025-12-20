"use client"

import { ProgramasList } from "@/components/pages/programas-list";
import { ProgramaResponseDTO, UsuarioDepartamentoDTORolesItem } from "../../api/generated/model";
import { useListProgramas } from "../../api/generated/client";
import { useDept } from "@/context/dept-context";
import { useRole } from "@/context/role-context";
import { AlertCircle } from "lucide-react";

export default function Programas() {

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

    const { activeDepartamento } = useDept()
    const { activeRole } = useRole();
    

    if (!activeDepartamento || !activeDepartamento.departamentoId) {
      return(
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-700">Seleccione un departamento para ver sus programas</p>
          </div>
        </div>
      )
    }
    const programas: ProgramaResponseDTO[] = useListProgramas({
        departamentoId: activeDepartamento?.departamentoId,
        rolActivo: activeRole || UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN
    }).data || [];

    return (
      <ProgramasList programas={programas} />
      // <ProgramasList programas={programas} totalPages={totalPages} />
    );
}
