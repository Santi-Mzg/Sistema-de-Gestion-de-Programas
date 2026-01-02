"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProgramaResponseDTO, ProgramaCargaDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, EstadoHistoricoResponseDTOEstado } from "@/app/api/generated/model"
import { useGetPrograma, useProfesorCarga } from "@/app/api/generated/client"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ProgramaCarreraBlockView } from "./programa-carrera-block-view"

interface SyllabusFormProps {
  // programa: ProgramaResponseDTO
  // onSubmit: (data: ProgramaCargaProfesorDTO) => void
  id: number,
  onCancel?: () => void
}


export function SyllabusProfesorForm({ id, onCancel }: SyllabusFormProps) {
  const router = useRouter();
  const programaQuery = useGetPrograma(id);
  const programa: ProgramaResponseDTO | undefined = programaQuery.data;
  
  console.log("Programa cargado en el formulario:", programa);
  const [formData, setFormData] = useState<ProgramaCargaDTO>({
      cargaHorariaPractica: 0,
      fundamentacion: "",
      objetivos: "",
      programaAnalitico: "",
      metodologia: "",
      modalidadEvaluacion: "",
      bibliografia: "",
      estado: EstadoHistoricoResponseDTOEstado.INCOMPLETO_POR_PROFESOR,
  })

  const { mutate, isPending } = useProfesorCarga({
    mutation: {
      onSuccess: () => {
        toast({
          title: "✓ Éxito",
          description: "Información cargada exitosamente",
          variant: "success",
        })      
        setFormData({
          cargaHorariaPractica: 0,
          fundamentacion: "",
          objetivos: "",
          programaAnalitico: "",
          metodologia: "",
          modalidadEvaluacion: "",
          bibliografia: "",
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


  useEffect(() => {
      if (programa) {
          setFormData({
              cargaHorariaPractica: programa.cargaHorariaPractica || 0,
              fundamentacion: programa.fundamentacion || "",
              objetivos: programa.objetivos || "",
              programaAnalitico: programa.programaAnalitico || "",
              metodologia: programa.metodologia || "",
              modalidadEvaluacion: programa.modalidadEvaluacion || "",
              bibliografia: programa.bibliografia || "",
              estado: programa.estado || EstadoHistoricoResponseDTOEstado.INCOMPLETO_POR_PROFESOR,
          });
      }
  }, [programa]); // Se ejecuta cuando 'programa' pasa de undefined a tener datos.


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() 
    mutate({
      data: formData,
      id: id
    });
  }

  const handleSingleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }


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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* HEADER */}
      <div className="bg-linear-to-r from-primary/10 to-accent/10 border-l-4 border-primary rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Carga de datos de Programa Académico</h1>
            <p className="text-muted-foreground">
              {programa.materia?.nombre} ({programa.materia?.codigo})
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <CheckCircle2 className="text-primary" size={20} />
            <span className="font-semibold text-primary">Por completar</span>
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
              value={programa.materia?.departamento || ""}
              className="border-border focus:border-primary"
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
              value={programa.anio}
              className="border-border focus:border-primary"
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
              value={programa.materia?.nombre}
              className="border-border focus:border-primary"
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
              value={programa.materia?.codigo}
              className="border-border focus:border-primary"
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
              value={programa.materia?.area}
              className="border-border focus:border-primary"
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
            value={programa.profesorResponsable?.apellido + " " + programa.profesorResponsable?.nombre + " (" + programa.profesorResponsable?.legajo + ")" || ""}
            className="border-border focus:border-primary"
            readOnly
          />
        </div>
      </div>

      {/* BLOQUE MÚLTIPLE */}
      <div className="border-l-4 border-accent p-6 py-4 bg-accent/5 rounded-r-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-accent">Información por Carrera</h2>
        </div>

        <div className={programa.bloqueMultiple && programa.bloqueMultiple?.length > 3 ? "space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20" : "space-y-6"}>
          {programa.bloqueMultiple?.map((block, index) => (
            <ProgramaCarreraBlockView
              key={index}
              block={block}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* CONFIGURACIÓN GENERAL */}
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Cargas horarias y Créditos</h2>

        {/* Carga Horaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Cantidad de Semanas</Label>
            <Input value={programa.cantidadSemanas || ""} readOnly className="border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga Horaria Semanal</Label>
            <Input value={programa.cargaHorariaSemanal || ""} readOnly className="border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Carga Horaria Total</Label>
            <Input value={programa.cargaHorariaTotal || ""} readOnly className="border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Créditos</Label>
            <Input value={programa.creditos || ""} readOnly className="border-border focus:border-primary" />
          </div>
        </div>

        {/* Carga Práctica */}
        <div className="space-y-2">
          <Label htmlFor="cargaPractica" className="text-sm font-semibold text-foreground">
            Carga Horaria Práctica *
          </Label>
          <Input
            id="cargaPractica"
            type="number"
            value={formData.cargaHorariaPractica}
            onChange={(e) => handleSingleFieldChange("cargaHorariaPractica", Number.parseInt(e.target.value))}
            placeholder="ej: 64"
            className="border-border focus:border-primary bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

        {/* Campos de texto largo */}
      <div className="border-l-4 border-primary p-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Contenido Académico</h2>

        <div className="space-y-2">
          <Label htmlFor="fundamentacion" className="text-sm font-semibold text-foreground">
            Fundamentación *
          </Label>
          <Textarea
            id="fundamentacion"
            value={formData.fundamentacion}
            onChange={(e) => handleSingleFieldChange("fundamentacion", e.target.value)}
            placeholder="Justifica la importancia de esta Materia..."
            className="border-border focus:border-primary min-h-24 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objetivos" className="text-sm font-semibold text-foreground">
            Objetivos *
          </Label>
          <Textarea
            id="objetivos"
            value={formData.objetivos}
            onChange={(e) => handleSingleFieldChange("objetivos", e.target.value)}
            placeholder="Define los objetivos de aprendizaje..."
            className="border-border focus:border-primary min-h-24 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="programa" className="text-sm font-semibold text-foreground">
            Programa Analítico *
          </Label>
          <Textarea
            id="programa"
            value={formData.programaAnalitico}
            onChange={(e) => handleSingleFieldChange("programaAnalitico", e.target.value)}
            placeholder="Detalla el contenido temático del curso..."
            className="border-border focus:border-primary min-h-32 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metodologia" className="text-sm font-semibold text-foreground">
            Metodología *
          </Label>
          <Textarea
            id="metodologia"
            value={formData.metodologia}
            onChange={(e) => handleSingleFieldChange("metodologia", e.target.value)}
            placeholder="Describe los métodos de enseñanza..."
            className="border-border focus:border-primary min-h-24 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluacion" className="text-sm font-semibold text-foreground">
            Modalidad de Evaluación *
          </Label>
          <Textarea
            id="evaluacion"
            value={formData.modalidadEvaluacion}
            onChange={(e) => handleSingleFieldChange("modalidadEvaluacion", e.target.value)}
            placeholder="Especifica cómo se evaluará el aprendizaje..."
            className="border-border focus:border-primary min-h-24 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bibliografia" className="text-sm font-semibold text-foreground">
            Bibliografía *
          </Label>
          <Textarea
            id="bibliografia"
            value={formData.bibliografia}
            onChange={(e) => handleSingleFieldChange("bibliografia", e.target.value)}
            placeholder="Referencias bibliográficas recomendadas..."
            className="border-border focus:border-primary min-h-32 resize-none bg-background"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button 
          type="submit" 
          disabled={isPending}
          className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-medium"
        >
          {isPending ? "Creando..." : "Cargar Datos"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
