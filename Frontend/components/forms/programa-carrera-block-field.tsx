"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Check, ChevronsUpDown, X } from "lucide-react"
import { CarreraResponseDTO, MateriaResponseDTO, ProgramaCarreraCreateDTO } from "@/app/api/generated/model"
import { getListMateriasCarreraPlanQueryKey, useListMateriasCarreraPlan } from "@/app/api/generated/client"
import React from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

interface ProgramaCarreraBlockProps {
  materiaId: number
  block: ProgramaCarreraCreateDTO
  index: number
  carreras: CarreraResponseDTO[]
  // selectedCarreraPlanIds: number[]
  onUpdate: (index: number, block: ProgramaCarreraCreateDTO) => void
  onRemove: (index: number) => void
}
export const ProgramaCarreraCreateBlock = React.memo(function ProgramaCarreraBlock({
  materiaId,
  block,
  index,
  carreras,
  // selectedCarreraPlanIds,
  onUpdate,
  onRemove,
}: ProgramaCarreraBlockProps) {
  const [selectedCarrera, setSelectedCarrera] = useState<CarreraResponseDTO | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (block.carreraPlanId && carreras.length > 0) {
      const carreraEncontrada = carreras.find(c => 
        c.planes?.some(p => p.id === block.carreraPlanId)
      );
      
      if (carreraEncontrada) {
        setSelectedCarrera(carreraEncontrada);
      }
    }
  }, [block.carreraPlanId, carreras]);


  const materiasQuery = useListMateriasCarreraPlan(selectedCarrera?.id ?? 0, {
    query: {
      enabled: !!selectedCarrera?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      queryKey: getListMateriasCarreraPlanQueryKey(selectedCarrera?.id ?? 0),
    },
  })

  const filteredMaterias = useMemo(() => {
    if (!materiasQuery.data) return []
    return materiasQuery.data.filter((m: MateriaResponseDTO) => m.id !== materiaId)
  }, [materiasQuery.data, materiaId])

  const handleFieldChange = (field: keyof ProgramaCarreraCreateDTO, value: any) => {
    onUpdate(index, {
      ...block,
      [field]: value,
    })
  }

  console.log("Planes:" + JSON.stringify(selectedCarrera?.planes))

  const toggleCorrelativaFuerte = useCallback(
    (id: number) => {
      const nuevosFuertes = block.correlativasFuertesIds?.includes(id)
        ? block.correlativasFuertesIds.filter(x => x !== id)
        : [...(block.correlativasFuertesIds || []), id]

      const nuevasDebiles = nuevosFuertes.includes(id)
      ? block.correlativasDebilesIds?.filter((x) => x !== id)
      : block.correlativasDebilesIds
      
      onUpdate(index, {
        ...block,
        correlativasFuertesIds: nuevosFuertes,
        correlativasDebilesIds: nuevasDebiles
      })
    },
    [block, index, onUpdate]
  )


  const toggleCorrelativaDebil = useCallback(
    (id: number) => {
      const nuevasDebiles = block.correlativasDebilesIds?.includes(id)
        ? block.correlativasDebilesIds.filter((x) => x !== id)
      : [...(block.correlativasDebilesIds || []), id]

    // Si se agrega como débil, remover de fuertes
    const nuevosFuertes = nuevasDebiles.includes(id)
      ? block.correlativasFuertesIds?.filter((x) => x !== id)
      : block.correlativasFuertesIds

    onUpdate(index, {
      ...block,
      correlativasFuertesIds: nuevosFuertes,
      correlativasDebilesIds: nuevasDebiles,
    })
    },
    [block, index, onUpdate]
  )
  

  return (
    <div className="relative border-2 border-primary/20 rounded-lg p-6 bg-background space-y-6">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className={"absolute top-3 right-3 p-1 hover:bg-destructive/10 rounded text-destructive"}
        title="Eliminar bloque"
      >
        <X size={20} />
      </button>

      <div className="text-lg font-semibold text-primary">#{index + 1}</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* BUSCADOR DE CARRERA */}
        <div className="flex flex-col space-y-2">
          <Label className="text-sm font-semibold">Carrera *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal border-border"
              >
                {selectedCarrera 
                  ? selectedCarrera.nombre 
                  : "Seleccionar carrera..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
              <Command>
                <CommandInput placeholder="Buscar..." />
                <CommandList className="pointer-events-auto">
                  <CommandEmpty>No se encontró la carrera.</CommandEmpty>
                  <CommandGroup>
                    {carreras.map((carrera) => (
                      <CommandItem
                        key={carrera.id}
                        value={carrera.nombre} // El buscador filtra por este valor
                        onSelect={() => {
                          setSelectedCarrera(carrera)
                          handleFieldChange("carreraPlanId", 0)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCarrera?.id === carrera.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {carrera.nombre}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`plan-${index}`} className="text-sm font-semibold text-foreground">
            Plan *
          </Label>
          <select
            id={`plan-${index}`}
            value={block.carreraPlanId?.toString() ?? ""}
            onChange={(e) => handleFieldChange("carreraPlanId", Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!selectedCarrera}
          >
            <option value="">Seleccionar plan...</option>
            {/* {selectedCarrera?.planes?.filter(plan => !selectedCarreraPlanIds.includes(plan.id!)).map((plan) => ( */}
            {selectedCarrera?.planes?.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {"Plan "+plan.anio +" - Versión "+plan.version}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`ubicacion-${index}`} className="text-sm font-semibold text-foreground">
            Ubicación en Plan *
          </Label>
          <Input
            id={`ubicacion-${index}`}
            value={block.ubicacionEnPlan}
            onChange={(e) => handleFieldChange("ubicacionEnPlan", e.target.value)}
            placeholder="ej: Segundo semestre"
            className="border-border focus:border-primary"
            required
          />
        </div>
      </div>

      {materiasQuery.isLoading ? (
          <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando materias...</p>
          </div>
      ) : materiasQuery.error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las materias</p>
          </div>
      ) : (
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Correlativas Fuertes
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredMaterias?.map((materia: MateriaResponseDTO) => (
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

          <div className="space-y-3 border border-primary/20 rounded-lg p-4 bg-primary/5">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Correlativas Débiles
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredMaterias?.map((materia: MateriaResponseDTO) => (
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
      )}

      <div className="space-y-2">
        <Label htmlFor={`contribucion-${index}`} className="text-sm font-semibold text-foreground">
          Contribución *
        </Label>
        <Textarea
          id={`contribucion-${index}`}
          value={block.contribucion}
          onChange={(e) => handleFieldChange("contribucion", e.target.value)}
          placeholder="Describe la contribución de esta carrera..."
          className="border-border focus:border-primary min-h-16 resize-none"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`contenidos-${index}`} className="text-sm font-semibold text-foreground">
          Contenidos Mínimos *
        </Label>
        <Textarea
          id={`contenidos-${index}`}
          value={block.contenidosMinimos}
          onChange={(e) => handleFieldChange("contenidosMinimos", e.target.value)}
          placeholder="Lista los contenidos mínimos requeridos..."
          className="border-border focus:border-primary min-h-16 resize-none"
          required
        />
      </div>
    </div>
  )
})
