"use client"

import { SyllabusAdministrativoForm } from "@/components/forms/programa-administracion-form";
import { Suspense } from "react";


export default function CrearPrograma() {
    return (
      <Suspense fallback={
        <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-yellow-700">Cargando...</p>
          </div>
        </div>
      }>
        <SyllabusAdministrativoForm />
      </Suspense>
    );
}
