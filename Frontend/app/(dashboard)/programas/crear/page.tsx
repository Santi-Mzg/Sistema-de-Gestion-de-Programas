"use client"

import { SyllabusCreationForm } from "@/components/forms/programa-creation-form";
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";


function FormularioConMateriaInicial() {
    const searchParams = useSearchParams();
    const { activeDepartamento } = useDept();
    const materiaIdInicial = searchParams.get("materiaId");

    return <SyllabusCreationForm
      key={JSON.stringify([activeDepartamento?.departamentoId, materiaIdInicial])}
      materiaIdInicial={materiaIdInicial} />;
}

export default function CrearPrograma() {
    const { activeRole } = useRole()


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

    if(activeRole !== "ADMINISTRACION") {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">No tienes permisos para cargar programas</p>
          </div>
        </div>
      )
    }

    return (
      <Suspense fallback={
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando...</p>
          </div>
        </div>
      }>
        <FormularioConMateriaInicial />
      </Suspense>
    );
}
