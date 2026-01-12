"use client"

import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";
import { useRole } from "@/context/role-context";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function CompletarPrograma() {
  const { id } = useParams<{ id: string }>()  
  const { activeRole } = useRole()

  // const programa: ProgramaResponseDTO = useGetPrograma(Number(id)).data!;

  // if (!programa || !programa.id) {
  //   return <div className="p-8 max-w-7xl mx-auto">No se ha podido cargar el programa solicitado.</div>;
  // }

  //   // 💡 Esta es la función que se pasa al formulario
  //   const handleFormSubmit = (data: ProgramaCargaProfesorDTO) => {
  //     // La función 'mutate' espera el objeto { data: T } si no se especificó un mutator diferente
  //     mutate({ id: programa.id!, data });
  //   };


    if (!activeRole) {
      return(
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando...</p>
          </div>
       </div>
      )
    }

    if(activeRole !== "SYSTEM_ADMIN" && activeRole !== "ADMINISTRACION") {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">No tienes permisos para completar programas</p>
          </div>
        </div>
      )
    }

    return (
      <SyllabusAdministrativoForm id={Number(id)} />
    );
}
