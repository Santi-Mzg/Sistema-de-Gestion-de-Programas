import { CarreraCreateDTO } from "@/app/api/generated/model";
import { useCreateCarrera } from "@/app/api/generated/syllabusApi";
import { CarreraForm } from "@/components/forms/carrera-form";

export default function CrearCarrera() {
  const { mutate, isPending } = useCreateCarrera({
        mutation: {
          onSuccess: () => {
            alert("Carrera creada exitosamente!");
            // Aquí puedes invalidar otras queries con queryClient.invalidateQueries(...)
          },
          onError: (error: Error) => {
            alert(`Error al crear: ${error.message}`);
          },
        }
    });

    // 💡 Esta es la función que se pasa al formulario
    const handleFormSubmit = (data: CarreraCreateDTO) => {
      // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
      mutate({ data }); 
    };

    return (
      <CarreraForm onSubmit={handleFormSubmit} />
    );
}
