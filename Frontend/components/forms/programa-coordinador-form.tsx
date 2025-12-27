"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Plus } from "lucide-react"
import { ProgramaCarreraBlock } from "./programa-carrera-block"
import { ProgramaResponseDTO, ProgramaCargaAdministrativoDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, DepartamentoResponseDTO, EstadoHistoricoResponseDTOEstado, EstadoUpdateDTO, EstadoUpdateDTOAccion, EstadoUpdateDTODestinoRechazo } from "@/app/api/generated/model"
import { useCreatePrograma, useListMateriasDepartamento, useActualizarEstado, useGetPrograma } from "@/app/api/generated/client"
import { RechazoDialog } from "../modals/rechazo-dialog"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface SyllabusFormProps {
  // programa: ProgramaResponseDTO
  // onSubmit: (data: ProgramaCargaProfesorDTO) => void
  id: number,
  onCancel?: () => void
}


export function SyllabusCoordinadorForm({ id, onCancel }: SyllabusFormProps) {
  const router = useRouter();
  const programaQuery = useGetPrograma(id);
  const programa: ProgramaResponseDTO | undefined = programaQuery.data;
  
  const [rechazDialogOpen, setRechazDialogOpen] = useState(false)
  const [formEstadoData, setFormEstadoData] = useState<EstadoUpdateDTO>({
      accion: undefined,
      destinoRechazo: undefined,
      justificacion: "",
  })

  const { mutate, isPending } = useActualizarEstado({
    mutation: {
      onSuccess: (data, variables) => {
        toast({
          title: "✓ Éxito",
          description: `Programa ${variables.data.accion === EstadoUpdateDTOAccion.APROBAR ? "aprobado" : "rechazado"} exitosamente`,
          variant: "success",
        })      

        router.push('/'); 
      },
      onError: (error: Error) => {
        toast({
          title: "✗ Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      },    
    }
  });


  if (programaQuery.isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del programa...</p>
        </div>
      </div>
    )
  }

  if (programaQuery.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">Error al obtener el programa</p>
        </div>
      </div>
    )
  }

  if (!programa || !programa.id) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="text-yellow-600" size={24} />
          <p className="text-yellow-700">El programa solicitado no existe o no pudo ser cargado</p>
        </div>
      </div>
    )
  }

  const handleAceptar = () => {
    const data: EstadoUpdateDTO = {
      accion: EstadoUpdateDTOAccion.APROBAR,
      destinoRechazo: undefined,
      justificacion: undefined,
    }
    mutate({
      data,
      id: id
    });
  }

  const handleRechazarConfirm = (destino: "ADMINISTRACION" | "DOCENTE", justificacion: string) => {
    const data: EstadoUpdateDTO = {
      accion: EstadoUpdateDTOAccion.RECHAZAR,
      destinoRechazo:
        destino === "ADMINISTRACION"
          ? EstadoUpdateDTODestinoRechazo.ADMINISTRACION
          : EstadoUpdateDTODestinoRechazo.DOCENTE,
      justificacion,
    }
    setRechazDialogOpen(false)
    mutate({
      data,
      id: id
    });
  }

  return (
    <form className="space-y-8 pb-8">
      {/* HEADER */}
      <div className="bg-linear-to-r from-primary/10 to-accent/10 border-l-4 border-primary rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Revisión de Syllabus</h1>
            <p className="text-muted-foreground">
              {programa.materia?.nombre} ({programa.materia?.codigo})
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <CheckCircle2 className="text-primary" size={20} />
            <span className="font-semibold text-primary">En Revisión</span>
          </div>
        </div>
      </div>

      {/* BLOQUE ÚNICO */}
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Información Básica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Departamento</Label>
            <Input value={programa.materia?.departamento || ""} disabled className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Materia</Label>
            <Input value={`${programa.materia?.codigo} - ${programa.materia?.nombre}`} disabled className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Profesor Responsable</Label>
            <Input value={programa.profesorResponsable?.apellido + " " + programa.profesorResponsable?.nombre + " (" + programa.profesorResponsable?.legajo + ")" || ""} disabled className="bg-background"/>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Área</Label>
            <Input value={programa.materia?.area || ""} disabled className="bg-background" />
          </div>
        </div>
      </div>

      {/* BLOQUE MÚLTIPLE */}
      {programa.bloqueMultiple && programa.bloqueMultiple.length > 0 && (
        <div className="border-l-4 border-accent pl-6 py-4 bg-accent/5 rounded-r-lg">
          <h2 className="text-lg font-bold text-accent mb-6">Información por Carrera</h2>

          <div className="space-y-6">
            {programa.bloqueMultiple.map((block, index) => (
              <ProgramaCarreraBlock
                key={index}
                materiaId={programa.materia?.id || 0}
                block={block}
                index={index}
                carreras={[]}
                onUpdate={() => {}}
                onRemove={() => {}}
                isDisabled={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN GENERAL */}
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Configuración General</h2>

        {/* Carga Horaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga Horaria Total</Label>
            <Input value={programa.cargaHorariaTotal || ""} disabled className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga Horaria Semanal</Label>
            <Input value={programa.cargaHorariaSemanal || ""} disabled className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Créditos</Label>
            <Input value={programa.creditos || ""} disabled className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Cantidad de Semanas</Label>
            <Input value={programa.cantidadSemanas || ""} disabled className="bg-background" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Carga Horaria Práctica</Label>
          <Input value={programa.cargaHorariaPractica || ""} disabled className="bg-background" />
        </div>
      </div>

      {/* CONTENIDO ACADÉMICO */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-primary pl-6 border-l-4 border-primary">Contenido Académico</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Fundamentación</Label>
            <Textarea value={programa.fundamentacion || ""} disabled className="bg-background min-h-24" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Objetivos</Label>
            <Textarea value={programa.objetivos || ""} disabled className="bg-background min-h-24" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Programa Analítico</Label>
          <Textarea value={programa.programaAnalitico || ""} disabled className="bg-background min-h-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Metodología</Label>
            <Textarea value={programa.metodologia || ""} disabled className="bg-background min-h-24" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Modalidad de Evaluación</Label>
            <Textarea value={programa.modalidadEvaluacion || ""} disabled className="bg-background min-h-24" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Bibliografía</Label>
          <Textarea value={programa.bibliografia || ""} disabled className="bg-background min-h-24" />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-6 border-t border-border sticky bottom-0 bg-background z-10 p-4 rounded-t-lg">
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
          Atrás
        </Button>
        <Button
          type="button"
          onClick={handleAceptar}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? "Procesando..." : "✓ Aprobar"}
        </Button>
        <Button
          type="button"
          onClick={() => setRechazDialogOpen(true)}
          disabled={isPending}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          ✕ Rechazar
        </Button>
      </div>

      {/* RECHAZO DIALOG */}
      <RechazoDialog
        open={rechazDialogOpen}
        onOpenChange={setRechazDialogOpen}
        onConfirm={handleRechazarConfirm}
        isLoading={isPending}
      />
    </form>
  )
}
