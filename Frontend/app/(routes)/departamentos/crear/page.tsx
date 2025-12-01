import { DepartamentoCreateDTO } from "@/app/api/generated/model";
import { useCreateDepartamento } from "@/app/api/generated/syllabusApi";
import { DepartamentoForm } from "@/components/forms/departamento-form";


export default function CrearDepartamento() {
  const { mutate, isPending } = useCreateDepartamento({
        mutation: {
          onSuccess: () => {
            alert("Departamento creado exitosamente!");
            // Aquí puedes invalidar otras queries con queryClient.invalidateQueries(...)
          },
          onError: (error: Error) => {
            alert(`Error al crear: ${error.message}`);
          },
        }
    });

    // 💡 Esta es la función que se pasa al formulario
    const handleFormSubmit = (data: DepartamentoCreateDTO) => {
      // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
      mutate({ data }); 
    };

    return (
      <DepartamentoForm onSubmit={handleFormSubmit} />
    );
}
