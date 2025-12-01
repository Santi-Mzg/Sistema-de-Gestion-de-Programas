"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProgramaCarreraBlock } from "./programa-carrera-block"
import { ProgramaResponseDTO, ProgramaCargaProfesorDTO, UserResponseDTO, CarreraResponseDTO, MateriaResponseDTO, EstadoHistoricoResponseDTOEstado } from "@/app/api/generated/model"

interface SyllabusFormProps {
  programa: ProgramaResponseDTO
  onSubmit: (data: ProgramaCargaProfesorDTO) => void
  onCancel?: () => void
}


export function SyllabusProfesorForm({ programa, onSubmit, onCancel }: SyllabusFormProps) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* BLOQUE ÚNICO */}
      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Bloque Único</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
              Departamento *
            </Label>
            <select
              id="materia"
              value={programa.nombreDepartamento || ""}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            >
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materia" className="text-sm font-semibold text-foreground">
              Materia *
            </Label>
            <select
              id="materia"
              value={programa.codigoMateria + " - " + programa.nombreMateria || ""}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            >
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profesor" className="text-sm font-semibold text-foreground">
              Profesor Responsable *
            </Label>
            <select
              id="profesor"
              value={programa.profesorResponsable || ""}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            >
            </select>
          </div>
        </div>
      </div>

      {/* BLOQUE MÚLTIPLE */}
      <div className="border-l-4 border-accent pl-6 py-4 bg-accent/5 rounded-r-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-accent">Bloques por Carrera</h2>
        </div>

        <div className="space-y-6">
          {programa.carreras?.map((block, index) => (
            <ProgramaCarreraBlock
              key={index}
              block={block}
              index={index}
              carreras={[]}
              materiasPorCarrera={[]}
              onUpdate={() => {}}
              onRemove={() => {}}
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
              className="border-border focus:border-primary"
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
              className="border-border focus:border-primary"
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
            className="border-border focus:border-primary"
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
            className="border-border focus:border-primary min-h-20 resize-none"
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
            className="border-border focus:border-primary min-h-20 resize-none"
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
            className="border-border focus:border-primary min-h-20 resize-none"
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
            className="border-border focus:border-primary min-h-20 resize-none" 
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
            className="border-border focus:border-primary min-h-20 resize-none"
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
            className="border-border focus:border-primary min-h-20 resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-medium">
          Crear Sílabus
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
