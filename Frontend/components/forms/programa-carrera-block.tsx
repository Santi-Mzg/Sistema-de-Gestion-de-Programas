"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { ProgramaCarreraCreateDTO } from "@/app/api/generated/model/programaCarreraCreateDTO"
import { CarreraResponseDTO, MateriaResponseDTO } from "@/app/api/generated/model"
import { useListMateriasCarrera } from "@/app/api/generated/syllabusApi"

interface ProgramaCarreraBlockProps {
  block: ProgramaCarreraCreateDTO
  index: number
  carreras: CarreraResponseDTO[]
  onUpdate: (index: number, block: ProgramaCarreraCreateDTO) => void
  onRemove: (index: number) => void
}

export function ProgramaCarreraBlock({
  block,
  index,
  carreras,
  onUpdate,
  onRemove,
}: ProgramaCarreraBlockProps) {
  const [selectedCarreraId, setSelectedCarreraId] = useState<number | null>(block.carreraId || null)
  const [materiasDisponibles, setMateriasDisponibles] = useState<MateriaResponseDTO[]>([])


  const { 
    data: materias 
  } = useListMateriasCarrera(selectedCarreraId!, {
    query: {
      queryKey: ["materiasPorCarrera", selectedCarreraId],
      enabled: !!selectedCarreraId,
    },
  })

  useEffect(() => {
    if (materias) {
          setMateriasDisponibles(materias) 
    }
  }, [materias])

  const handleCarreraChange = (carreraId: number) => {
    setSelectedCarreraId(carreraId)
    onUpdate(index, {
      ...block,
      carreraId,
    })
  }

  const handleFieldChange = (field: keyof ProgramaCarreraCreateDTO, value: any) => {
    onUpdate(index, {
      ...block,
      [field]: value,
    })
  }

  const toggleCorrelativaFuerte = (materiaId: number) => {
    const nuevosFuertes = block.correlativasFuertesIds?.includes(materiaId)
      ? block.correlativasFuertesIds.filter((id) => id !== materiaId)
      : [...(block.correlativasFuertesIds || []), materiaId]

    // Si se agrega como fuerte, remover de débiles
    const nuevasDebiles = nuevosFuertes.includes(materiaId)
      ? block.correlativasDebilesIds?.filter((id) => id !== materiaId)
      : block.correlativasDebilesIds

    onUpdate(index, {
      ...block,
      correlativasFuertesIds: nuevosFuertes,
      correlativasDebilesIds: nuevasDebiles,
    })
  }

  const toggleCorrelativaDebil = (materiaId: number) => {
    const nuevasDebiles = block.correlativasDebilesIds?.includes(materiaId)
      ? block.correlativasDebilesIds.filter((id) => id !== materiaId)
      : [...(block.correlativasDebilesIds || []), materiaId]

    // Si se agrega como débil, remover de fuertes
    const nuevosFuertes = nuevasDebiles.includes(materiaId)
      ? block.correlativasFuertesIds?.filter((id) => id !== materiaId)
      : block.correlativasFuertesIds

    onUpdate(index, {
      ...block,
      correlativasFuertesIds: nuevosFuertes,
      correlativasDebilesIds: nuevasDebiles,
    })
  }

  return (
    <div className="relative border-2 border-primary/20 rounded-lg p-6 bg-background space-y-6">
      <button
        onClick={() => onRemove(index)}
        className="absolute top-3 right-3 p-1 hover:bg-destructive/10 rounded text-destructive"
        title="Eliminar bloque"
      >
        <X size={20} />
      </button>

      <div className="text-sm font-semibold text-primary">Programa Carrera #{index + 1}</div>

      {/* Carrera Selection */}
      <div className="space-y-2">
        <Label htmlFor={`carrera-${index}`} className="text-sm font-semibold text-foreground">
          Carrera *
        </Label>
        <select
          id={`carrera-${index}`}
          value={selectedCarreraId || ""}
          onChange={(e) => handleCarreraChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Seleccionar carrera...</option>
          {carreras.map((carrera) => (
            <option key={carrera.id} value={carrera.id}>
              {carrera.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Plan */}
      <div className="space-y-2">
        <Label htmlFor={`plan-${index}`} className="text-sm font-semibold text-foreground">
          Plan
        </Label>
        <Input
          id={`plan-${index}`}
          value={block.plan}
          onChange={(e) => handleFieldChange("plan", e.target.value)}
          placeholder="ej: Plan 2023"
          className="border-border focus:border-primary bg-background"
        />
      </div>

      {/* Ubicación en Plan */}
      <div className="space-y-2">
        <Label htmlFor={`ubicacion-${index}`} className="text-sm font-semibold text-foreground">
          Ubicación en Plan
        </Label>
        <Input
          id={`ubicacion-${index}`}
          value={block.ubicacionEnPlan}
          onChange={(e) => handleFieldChange("ubicacionEnPlan", e.target.value)}
          placeholder="ej: Segundo semestre"
          className="border-border focus:border-primary bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Correlativas Fuertes */}
        <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
          <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
            Correlativas Fuertes
          </Label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {materiasDisponibles.map((materia) => (
              <label
                key={materia.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked={block.correlativasFuertesIds?.includes(materia.id || 0)}
                  onChange={() => toggleCorrelativaFuerte(materia.id || 0)}
                  disabled={block.correlativasDebilesIds?.includes(materia.id || 0)}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{materia.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Correlativas Débiles */}
        <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
          <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
            Correlativas Débiles
          </Label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {materiasDisponibles.map((materia) => (
              <label
                key={materia.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked={block.correlativasDebilesIds?.includes(materia.id || 0)}
                  onChange={() => toggleCorrelativaDebil(materia.id || 0)}
                  disabled={block.correlativasFuertesIds?.includes(materia.id || 0)}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{materia.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Contribución */}
      <div className="space-y-2">
        <Label htmlFor={`contribucion-${index}`} className="text-sm font-semibold text-foreground">
          Contribución
        </Label>
        <Textarea
          id={`contribucion-${index}`}
          value={block.contribucion}
          onChange={(e) => handleFieldChange("contribucion", e.target.value)}
          placeholder="Describe la contribución de esta carrera..."
          className="border-border focus:border-primary min-h-16 resize-none"
        />
      </div>

      {/* Contenidos Mínimos */}
      <div className="space-y-2">
        <Label htmlFor={`contenidos-${index}`} className="text-sm font-semibold text-foreground">
          Contenidos Mínimos
        </Label>
        <Textarea
          id={`contenidos-${index}`}
          value={block.contenidosMinimos}
          onChange={(e) => handleFieldChange("contenidosMinimos", e.target.value)}
          placeholder="Lista los contenidos mínimos requeridos..."
          className="border-border focus:border-primary min-h-16 resize-none"
        />
      </div>
    </div>
  )
}
