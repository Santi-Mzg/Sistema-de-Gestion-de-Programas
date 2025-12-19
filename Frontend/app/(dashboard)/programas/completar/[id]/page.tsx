import { ProgramaCargaProfesorDTO, ProgramaResponseDTO } from "@/app/api/generated/model";
import { SyllabusProfesorForm } from "@/components/forms/programa-profesor-form";


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}   

export default async function CompletarPrograma( {params}: PageProps ) {
  const {id} = await params;
  const programaId = Number(id);

  if (isNaN(programaId)) {
      // Manejar IDs inválidos
      return <div>ID de programa inválido.</div>;
  }
  // const programa: ProgramaResponseDTO = useGetPrograma(Number(id)).data!;

  // if (!programa || !programa.id) {
  //   return <div className="p-8 max-w-7xl mx-auto">No se ha podido cargar el programa solicitado.</div>;
  // }

  //   // 💡 Esta es la función que se pasa al formulario
  //   const handleFormSubmit = (data: ProgramaCargaProfesorDTO) => {
  //     // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
  //     mutate({ id: programa.id!, data });
  //   };



    return (
      <SyllabusProfesorForm id={programaId} />
    );
}
