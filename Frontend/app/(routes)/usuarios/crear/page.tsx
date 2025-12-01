import { DepartamentoCreateDTO } from "@/app/api/generated/model";
import { useCreateUser } from "@/app/api/generated/syllabusApi";
import { UsuarioForm } from "@/components/forms/usuario-form";


export default function CrearUsuario() {
  const { mutate, isPending } = useCreateUser({
        mutation: {
          onSuccess: () => {
            alert("Usuario creado exitosamente!");
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
      <UsuarioForm onSubmit={handleFormSubmit} />
    );
}
