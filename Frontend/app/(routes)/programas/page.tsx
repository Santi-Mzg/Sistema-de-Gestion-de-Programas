import { ProgramaResponseDTO } from "@/app/api/generated/model";
import { useListProgramas } from "@/app/api/generated/syllabusApi";

export default function Programas() {

    const programas: ProgramaResponseDTO[] = useListProgramas().data || [];

    return (
      <div className="p-8 max-w-7xl mx-auto">Lista de programas.</div>
    );
}
