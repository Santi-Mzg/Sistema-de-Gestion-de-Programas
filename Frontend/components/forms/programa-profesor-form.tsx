"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProgramaCarreraBlock } from "./programa-carrera-block"
import { ProgramaResponseDTO, ProgramaCargaProfesorDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, EstadoHistoricoResponseDTOEstado } from "@/app/api/generated/model"
import { useGetPrograma, useProfesorCarga } from "@/app/api/generated/client"
import { AlertCircle } from "lucide-react"

interface SyllabusFormProps {
  // programa: ProgramaResponseDTO
  // onSubmit: (data: ProgramaCargaProfesorDTO) => void
  id: number,
  onCancel?: () => void
}


export function SyllabusProfesorForm({ id, onCancel }: SyllabusFormProps) {
  const programaQuery = useGetPrograma(id);
  const programa: ProgramaResponseDTO | undefined = programaQuery.data;
  
  console.log("Programa cargado en el formulario:", programa);
  const [formData, setFormData] = useState<ProgramaCargaProfesorDTO>({
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
        onSuccess: () => alert("Programa cargado exitosamente!"),
        onError: (error: Error) => alert(`Error: ${error.message}`),
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

  
    const onSubmit = (data: any) => {
      mutate({
        data,
        id: id
      });
    };


  const handleSingleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() 
    onSubmit(formData)
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
      {/* BLOQUE ÚNICO */}
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Bloque Único</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="departamento" className="text-sm font-semibold text-foreground">
              Departamento *
            </Label>
            <Input
              id="departamento"
              type="text"
              value={programa.nombreDepartamento || ""}
              className="border-border focus:border-primary"
              disabled
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
              Materia *
            </Label>
            <Input
              id="materia"
              type="text"
              value={programa.codigoMateria + " - " + programa.nombreMateria || ""}
              className="border-border focus:border-primary"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profesor" className="text-sm font-semibold text-foreground">
              Profesor Responsable *
            </Label>
            <Input
              id="profesor"
              type="text"
              value={programa.profesorResponsable || ""}
              className="border-border focus:border-primary"
              disabled
            />
          </div>
        </div>
      </div>

      {/* BLOQUE MÚLTIPLE */}
      <div className="border-l-4 border-accent pl-6 py-4 bg-accent/5 rounded-r-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-accent">Bloques por Carrera</h2>
        </div>

        <div className="space-y-6">
          {programa.bloqueMultiple?.map((block, index) => (
            <ProgramaCarreraBlock
              key={block.key}
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

      {/* CONFIGURACIÓN GENERAL */}
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg space-y-6">
        <h2 className="text-lg font-bold text-primary">Configuración General</h2>

        {/* Carga Horaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cargaTotal" className="text-sm font-semibold text-foreground">
              Carga Horaria Total
            </Label>
            <Input
              id="cargaTotal"
              type="number"
              value={programa.cargaHorariaTotal}
              placeholder="ej: 128"
              className="border-border focus:border-primary"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargaSemanal" className="text-sm font-semibold text-foreground">
              Carga Horaria Semanal
            </Label>
            <Input
              id="cargaSemanal"
              type="number"
              value={programa.cargaHorariaSemanal}
              onChange={(e) => handleSingleFieldChange("cargaHorariaSemanal", Number.parseInt(e.target.value))}
              placeholder="ej: 8"
              className="border-border focus:border-primary"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditos" className="text-sm font-semibold text-foreground">
              Créditos
            </Label>
            <Input
              id="creditos"
              type="number"
              value={programa.creditos}
              onChange={(e) => handleSingleFieldChange("creditos", Number.parseInt(e.target.value))}
              placeholder="ej: 4"
              className="border-border focus:border-primary bg-background"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semanas" className="text-sm font-semibold text-foreground">
              Cantidad de Semanas
            </Label>
            <Input
              id="semanas"
              type="number"
              value={programa.cantidadSemanas}
              onChange={(e) => handleSingleFieldChange("cantidadSemanas", Number.parseInt(e.target.value))}
              placeholder="ej: 16"
              className="border-border focus:border-primary bg-background"
              disabled
            />
          </div>
        </div>

        {/* Carga Práctica */}
        <div className="space-y-2">
          <Label htmlFor="cargaPractica" className="text-sm font-semibold text-foreground">
            Carga Horaria Práctica
          </Label>
          <Input
            id="cargaPractica"
            type="number"
            value={formData.cargaHorariaPractica}
            onChange={(e) => handleSingleFieldChange("cargaHorariaPractica", Number.parseInt(e.target.value))}
            placeholder="ej: 64"
            className="border-border focus:border-primary bg-background"
          />
        </div>

        {/* Campos de texto largo */}
        <div className="space-y-2">
          <Label htmlFor="fundamentacion" className="text-sm font-semibold text-foreground">
            Fundamentación
          </Label>
          <Textarea
            id="fundamentacion"
            value={formData.fundamentacion}
            onChange={(e) => handleSingleFieldChange("fundamentacion", e.target.value)}
            placeholder="Justifica la importancia de esta Materia..."
            className="border-border focus:border-primary min-h-20 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objetivos" className="text-sm font-semibold text-foreground">
            Objetivos
          </Label>
          <Textarea
            id="objetivos"
            value={formData.objetivos}
            onChange={(e) => handleSingleFieldChange("objetivos", e.target.value)}
            placeholder="Define los objetivos de aprendizaje..."
            className="border-border focus:border-primary min-h-20 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="programa" className="text-sm font-semibold text-foreground">
            Programa Analítico
          </Label>
          <Textarea
            id="programa"
            value={formData.programaAnalitico}
            onChange={(e) => handleSingleFieldChange("programaAnalitico", e.target.value)}
            placeholder="Detalla el contenido temático del curso..."
            className="border-border focus:border-primary min-h-20 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metodologia" className="text-sm font-semibold text-foreground">
            Metodología
          </Label>
          <Textarea
            id="metodologia"
            value={formData.metodologia}
            onChange={(e) => handleSingleFieldChange("metodologia", e.target.value)}
            placeholder="Describe los métodos de enseñanza..."
            className="border-border focus:border-primary min-h-20 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluacion" className="text-sm font-semibold text-foreground">
            Modalidad de Evaluación
          </Label>
          <Textarea
            id="evaluacion"
            value={formData.modalidadEvaluacion}
            onChange={(e) => handleSingleFieldChange("modalidadEvaluacion", e.target.value)}
            placeholder="Especifica cómo se evaluará el aprendizaje..."
            className="border-border focus:border-primary min-h-20 resize-none bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bibliografia" className="text-sm font-semibold text-foreground">
            Bibliografía
          </Label>
          <Textarea
            id="bibliografia"
            value={formData.bibliografia}
            onChange={(e) => handleSingleFieldChange("bibliografia", e.target.value)}
            placeholder="Referencias bibliográficas recomendadas..."
            className="border-border focus:border-primary min-h-20 resize-none bg-background"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-medium">
          Cargar Programa
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
