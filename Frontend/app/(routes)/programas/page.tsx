import { ProgramaResponseDTO } from "@/app/api/generated/model";
import { listProgramas } from "@/app/api/generated/syllabusApi";
import { ProgramasList } from "@/components/pages/programas-list";

export default async function Programas() {

    const programas: ProgramaResponseDTO[] = await listProgramas();

    return (
      <ProgramasList programas={programas} />
    );
}
