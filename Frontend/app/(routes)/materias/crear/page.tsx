import { MateriaCreateDTO } from "@/app/api/generated/model";
import { useCreateMateria } from "@/app/api/generated/syllabusApi";
import { MateriaForm } from "@/components/forms/materia-form";


export default function CrearMateria() {
  const { mutate, isPending } = useCreateMateria({
        mutation: {
          onSuccess: () => {
            alert("Materia creado exitosamente!");
            // Aquí puedes invalidar otras queries con queryClient.invalidateQueries(...)
          },
          onError: (error: Error) => {
            alert(`Error al crear: ${error.message}`);
          },
        }
    });

    // 💡 Esta es la función que se pasa al formulario
    const handleFormSubmit = (data: MateriaCreateDTO) => {
      // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
      mutate({ data }); 
    };

    return (
      <MateriaForm onSubmit={handleFormSubmit} />
    );
}
