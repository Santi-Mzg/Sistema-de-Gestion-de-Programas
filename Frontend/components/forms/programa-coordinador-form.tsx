"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Plus } from "lucide-react"
import { ProgramaResponseDTO, EstadoUpdateDTO, EstadoUpdateDTOAccion, EstadoUpdateDTODestinoRechazo, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model"
import { useCreatePrograma, useListMateriasDepartamento, useActualizarEstado, useGetPrograma, getGetProgramaQueryKey, getListProgramasQueryKey } from "@/app/api/generated/client"
import { RechazoDialog } from "../modals/rechazo-dialog"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ProgramaCarreraBlockView } from "./programa-carrera-block-view"
import { useDept } from "@/context/dept-context"
import { useRole } from "@/context/role-context"
import { useQueryClient } from "@tanstack/react-query";

interface SyllabusFormProps {
  id: number,
}


export function SyllabusCoordinadorForm({ id }: SyllabusFormProps) {
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole()
  const router = useRouter();
  const queryClient = useQueryClient(); 
  
  const programaQuery = useGetPrograma(id,
    {
      query: {
        staleTime: 1000 * 60 * 5,
        queryKey: getGetProgramaQueryKey(id)
      }
    }
  );
  const programa: ProgramaResponseDTO | undefined = programaQuery.data;
  
  const [rechazDialogOpen, setRechazDialogOpen] = useState(false)

  const { mutate, isPending } = useActualizarEstado({
    mutation: {
      onSuccess: (data, variables) => {
        toast({
          title: "✓ Éxito",
          description: `Programa ${variables.data.accion === EstadoUpdateDTOAccion.APROBAR ? "aprobado" : "rechazado"} exitosamente`,
          variant: "success",
        })      

        queryClient.invalidateQueries({
          queryKey: getListProgramasQueryKey(
            activeDepartamento!.departamentoId!,
            { rolActivo: activeRole as UsuarioDepartamentoDTORolesItem }
          )
        });

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
    const data = {
      accion: EstadoUpdateDTOAccion.APROBAR,
      destinoRechazo: undefined,
      justificacion: undefined,
    }

    mutate({
      deptId: activeDepartamento?.departamentoId ?? 0,
      id: id,
      data: data,
      params: {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
      }
    });
  }

  const handleRechazarConfirm = (destino: UsuarioDepartamentoDTORolesItem, justificacion: string) => {
    const data = {
      accion: EstadoUpdateDTOAccion.RECHAZAR,
      destinoRechazo: destino,
      justificacion: justificacion,
    }

    setRechazDialogOpen(false)

    mutate({
      deptId: activeDepartamento?.departamentoId ?? 0,
      id: id,
      data: data,
      params: {
        rolActivo: activeRole as UsuarioDepartamentoDTORolesItem,
      }
    });
  }

  return (
    <form className="space-y-8 pb-8">
      {/* HEADER */}
      <div className="bg-linear-to-r from-primary/10 to-accent/10 border-l-4 border-primary rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Revisión de Programa Académico</h1>
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
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Información Básica</h2>

        <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="departamento" className="text-sm font-semibold text-foreground">
              Departamento
            </Label>
            <Input
              id="departamento"
              type="text"
              defaultValue={programa.materia?.departamento || ""}
              className="bg-background"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anio" className="text-sm font-semibold text-foreground">
              Año
            </Label>
            <Input
              id="anio"
              name="anio"
              defaultValue={programa.anio}
              className="bg-background"
              readOnly
            />
          </div>
        </div>

        <div className="space-y-6 grid grid-cols-2 md:grid-cols-3 gap-6">            
          <div className="space-y-2">
            <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
              Materia
            </Label>
            <Input
              id="materia"
              type="text"
              defaultValue={programa.materia?.nombre}
              className="bg-background"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo" className="text-sm font-semibold text-foreground">
              Código
            </Label>
            <Input
              id="codigo"
              type="text"
              defaultValue={programa.materia?.codigo}
              className="bg-background"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-semibold text-foreground">
              Área
            </Label>
            <Input
              id="area"
              type="text"
              defaultValue={programa.materia?.area}
              className="bg-background"
              readOnly
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profesor" className="text-sm font-semibold text-foreground">
            Profesor Responsable
          </Label>
          <Input
            id="profesor"
            type="text"
            defaultValue={programa.profesorResponsable?.apellido + " " + programa.profesorResponsable?.nombre + " (" + programa.profesorResponsable?.legajo + ")" || ""}
            className="bg-background"
            readOnly
          />
        </div>
      </div>

      {/* BLOQUE MÚLTIPLE */}
      {programa.bloqueMultiple && programa.bloqueMultiple.length > 0 && (
        <div className="border-l-4 border-accent p-6 py-4 bg-accent/5 rounded-r-lg">
          <h2 className="text-lg font-bold text-accent mb-6">Información por Carrera</h2>

        <div className={programa.bloqueMultiple && programa.bloqueMultiple?.length > 3 ? "space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20" : "space-y-6"}>
            {programa.bloqueMultiple.map((block, index) => (
              <ProgramaCarreraBlockView
                key={index}
                block={block}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN GENERAL */}
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Cargas horarias y Créditos</h2>

        {/* Carga Horaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Cantidad de Semanas</Label>
            <Input defaultValue={programa.cantidadSemanas || ""} readOnly className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga Horaria Semanal</Label>
            <Input defaultValue={programa.cargaHorariaSemanal || ""} readOnly className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga Horaria Total</Label>
            <Input defaultValue={programa.cargaHorariaTotal || ""} readOnly className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Créditos</Label>
            <Input defaultValue={programa.creditos || ""} readOnly className="bg-background" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Carga Horaria Práctica</Label>
          <Input defaultValue={programa.cargaHorariaPractica || ""} readOnly className="bg-background" />
        </div>
      </div>

      {/* CONTENIDO ACADÉMICO */}
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Contenido Académico</h2>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Fundamentación</Label>
          <Textarea defaultValue={programa.fundamentacion || ""} readOnly className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Objetivos</Label>
          <Textarea defaultValue={programa.objetivos || ""} readOnly className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Programa Analítico</Label>
          <Textarea defaultValue={programa.programaAnalitico || ""} readOnly className="bg-background min-h-32" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Metodología</Label>
          <Textarea defaultValue={programa.metodologia || ""} readOnly className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Modalidad de Evaluación</Label>
          <Textarea defaultValue={programa.modalidadEvaluacion || ""} readOnly className="bg-background min-h-24" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Bibliografía</Label>
          <Textarea defaultValue={programa.bibliografia || ""} readOnly className="bg-background min-h-32" />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-6 border-t border-border bg-background z-10 p-4 rounded-t-lg">

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
        <Button 
          type="button" 
          onClick={() => router.back()}
          variant="outline" 
          className="flex-1 bg-transparent"
        >
          Atrás
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
