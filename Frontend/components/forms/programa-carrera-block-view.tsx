"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import React from "react"
import { MateriaResponseDTO, ProgramaCarreraResponseDTO } from "@/app/api/generated/model"
import { LabelWithTooltip } from "../ui/label-with-tooltip"

interface ProgramaCarreraBlockProps {
  block: ProgramaCarreraResponseDTO
  index: number
}
export const ProgramaCarreraBlockView = React.memo(function ProgramaCarreraBlock({
  block,
  index,
}: ProgramaCarreraBlockProps) {

console.log("ProgramaCarreraBlockView Rendered" + JSON.stringify(block))
  return (
    <div className="relative border-2 border-primary/20 rounded-lg p-6 bg-background space-y-6">
      <div className="text-lg font-semibold text-primary">#{index+1+" "+block.carreraNombre+" (Plan "+block.plan?.anio+" - Versión "+block.plan?.version+")"}</div>
      <div className="space-y-6 grid grid-cols-2 md:grid-cols-3 gap-6">            
        <div className="space-y-2">
          <Label htmlFor={`carrera-${index}`} className="text-sm font-semibold text-foreground">
            Carrera
          </Label>
          <Input
            id={`carrera-${index}`}
            value={block.carreraNombre}
            className="bg-background border-border"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`plan-${index}`} className="text-sm font-semibold text-foreground">
            Plan
          </Label>
            <Input
              id={`plan-${index}`}
              value={"Plan "+block.plan?.anio+" - Versión "+block.plan?.version}
              className="bg-background border-border"
              disabled
            />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Ubicación en el Plan"
            required
            tooltip={
              <>
                <p>Indica en qué parte del plan de estudios se ubica la materia.</p>
              </>
            }
          />
          <Input
            id={`ubicacion-${index}`}
            value={block.ubicacionEnPlan}
            className="border-border focus:border-primary"
            disabled
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
          <LabelWithTooltip
            label="Correlativas Fuertes"
            tooltip={
              <>
                <p>Las asignaturas que deben estar aprobadas antes de cursar esta asignatura.</p>
              </>
            }
          />
          <div className="max-h-40 overflow-y-auto space-y-2">
            {block.correlativasFuertes?.map((materia: MateriaResponseDTO) => (
              <label
                key={materia.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked
                  className="rounded border-border"
                  readOnly
                />
                <span className="text-sm text-foreground">{materia.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
          <LabelWithTooltip
            label="Correlativas Débiles"
            tooltip={
              <>
                <p>Las asignaturas que deben estar cursadas antes de cursar esta asignatura.</p>
              </>
            }
          />
          <div className="max-h-40 overflow-y-auto space-y-2">
            {block.correlativasDebiles?.map((materia: MateriaResponseDTO) => (
              <label
                key={materia.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked
                  className="rounded border-border"
                  readOnly
                />
                <span className="text-sm text-foreground">{materia.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <LabelWithTooltip
          label="Contribución"
          tooltip={
            <>
              <p>Describe cómo esta asignatura contribuye al desarrollo de las competencias, conocimientos y habilidades previstas en el perfil de egreso de la carrera.</p>
            </>
          }
        />
        <Textarea
          id={`contribucion-${index}`}
          value={block.contribucion}
          className="border-border focus:border-primary min-h-16 resize-none"
          disabled
        />
      </div>

      <div className="space-y-2">
        <LabelWithTooltip
          label="Contenidos Mínimos"
          tooltip={
            <>
              <p>Los contenidos mínimos establecidos en el plan de estudios que deben abordarse obligatoriamente en la asignatura.</p>
            </>
          }
        />
        <Textarea
          id={`contenidos-${index}`}
          value={block.contenidosMinimos}
          className="border-border focus:border-primary min-h-16 resize-none"
          disabled
        />
      </div>
    </div>
  )
})
