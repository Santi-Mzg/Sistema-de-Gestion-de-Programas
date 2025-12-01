import { CarreraResponseDTO, DepartamentoResponseDTO, ProgramaCargaAdministrativoDTO, UserResponseDTO } from "@/app/api/generated/model";
import { useCreatePrograma, useListCarreras, useListDepartamentos } from "@/app/api/generated/syllabusApi";
import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";


export default function CrearPrograma() {

  const departamentosDisponibles: DepartamentoResponseDTO[] = useListDepartamentos().data || [];
  const carrerasDisponibles: CarreraResponseDTO[] = useListCarreras().data || [];
  
  const { mutate, isPending } = useCreatePrograma({
        mutation: {
          onSuccess: () => {
            alert("Programa creado exitosamente!");
            // Aquí puedes invalidar otras queries con queryClient.invalidateQueries(...)
          },
          onError: (error: Error) => {
            alert(`Error al crear: ${error.message}`);
          },
        }
    });

    // 💡 Esta es la función que se pasa al formulario
    const handleFormSubmit = (data: ProgramaCargaAdministrativoDTO) => {
      // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
      mutate({ data }); 
    };

    return (
      <SyllabusAdministrativoForm departamentosDisponibles={departamentosDisponibles} carrerasDisponibles={carrerasDisponibles} onSubmit={handleFormSubmit} />
    );
}
