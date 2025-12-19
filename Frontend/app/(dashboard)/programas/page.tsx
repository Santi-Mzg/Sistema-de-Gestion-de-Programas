"use client"

import { ProgramasList } from "@/components/pages/programas-list";
import { ProgramaResponseDTO } from "../../api/generated/model";
import { useListProgramas } from "../../api/generated/client";

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

    const programas: ProgramaResponseDTO[] = useListProgramas().data || [];

    return (
      <ProgramasList programas={programas} />
      // <ProgramasList programas={programas} totalPages={totalPages} />
    );
}
