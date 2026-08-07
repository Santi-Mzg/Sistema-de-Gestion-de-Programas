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
import {
  Control,
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  useWatch,
} from "react-hook-form";
import { ProgramaAdminFormData } from "@/lib/schemas/programa"
import { LabelWithTooltip } from "../ui/label-with-tooltip"

interface ProgramaCarreraBlockProps {
  materiaId: number;
  index: number;
  carreras: CarreraResponseDTO[];
  control: Control<ProgramaAdminFormData>;
  register: UseFormRegister<ProgramaAdminFormData>;
  setValue: UseFormSetValue<ProgramaAdminFormData>;
  errors: FieldErrors<ProgramaAdminFormData>;
  onRemove: (index: number) => void;
}
export const ProgramaCarreraCreateBlock = React.memo(function ProgramaCarreraBlock({
  materiaId,
  index,
  carreras,
  control,
  register,
  setValue,
  errors,
  onRemove,
}: ProgramaCarreraBlockProps) {
  const [selectedCarrera, setSelectedCarrera] = useState<CarreraResponseDTO | null>(null);
  const [open, setOpen] = useState(false);

  const block = useWatch({
    control,
    name: `bloqueMultiple.${index}`,
  })

  const blockErrors = errors.bloqueMultiple?.[index]

  useEffect(() => {
    const carreraPlanId = block?.carreraPlanId

    if (!carreraPlanId || carreras.length === 0) {
      return
    }

    const carreraEncontrada = carreras.find((carrera) =>
      carrera.planes?.some((plan) => plan.id === carreraPlanId)
    )

    setSelectedCarrera(carreraEncontrada ?? null)
  }, [block?.carreraPlanId, carreras])


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

  const toggleCorrelativaFuerte = useCallback(
    (id: number) => {
      const nuevosFuertes = block.correlativasFuertesIds?.includes(id)
        ? block.correlativasFuertesIds.filter(x => x !== id)
        : [...(block.correlativasFuertesIds || []), id]

      const nuevasDebiles = nuevosFuertes.includes(id)
      ? block.correlativasDebilesIds?.filter((x) => x !== id)
      : block.correlativasDebilesIds
      
      setValue(
        `bloqueMultiple.${index}.correlativasFuertesIds`,
        nuevosFuertes,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )

      setValue(
        `bloqueMultiple.${index}.correlativasDebilesIds`,
        nuevasDebiles,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )
    },
    [block, index, setValue]
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


      setValue(
        `bloqueMultiple.${index}.correlativasFuertesIds`,
        nuevosFuertes,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )

      setValue(
        `bloqueMultiple.${index}.correlativasDebilesIds`,
        nuevasDebiles,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )
    },
    [block, index, setValue]
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
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-invalid={!!blockErrors?.carreraPlanId}
                className={cn(
                  "w-full justify-between font-normal border-2",
                  blockErrors?.carreraPlanId
                    ? "border-red-500"
                    : "border-border"
                )}
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
                        value={carrera.nombre}
                        onSelect={() => {
                          setSelectedCarrera(carrera)
                          setValue(`bloqueMultiple.${index}.carreraPlanId`, 0, {shouldDirty: true,})
                          setValue(`bloqueMultiple.${index}.correlativasFuertesIds`, [], {shouldDirty: true,})
                          setValue(`bloqueMultiple.${index}.correlativasDebilesIds`, [], {shouldDirty: true,})
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
          <div className="min-h-5">
            {blockErrors?.carreraPlanId && !selectedCarrera && (
              <p className="text-sm text-red-500">
                Debe seleccionar una carrera.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`plan-${index}`} className="text-sm font-semibold text-foreground">
            Plan *
          </Label>
          <select
            id={`plan-${index}`}
            value={block.carreraPlanId?.toString() ?? ""}
            onChange={(event) => {
              setValue(`bloqueMultiple.${index}.carreraPlanId`, Number(event.target.value), {shouldDirty: true})
            }}
            aria-invalid={!!blockErrors?.carreraPlanId}
            className={cn(
              "w-full px-3 py-2 border-2 rounded-md bg-background text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              blockErrors?.carreraPlanId
                ? "border-red-500"
                : "border-border"
            )}  
            disabled={!selectedCarrera}
          >
            <option value="">Seleccionar plan...</option>
            {selectedCarrera?.planes?.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {"Plan "+plan.anio +" - Versión "+plan.version}
              </option>
            ))}
          </select>
          <div className="min-h-5">
            {blockErrors?.carreraPlanId && selectedCarrera && (
              <p className="text-sm text-red-500" role="alert">
                {blockErrors.carreraPlanId.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <LabelWithTooltip
            label="Ubicación en el Plan"
            required
            tooltip={
              <>
                <p>Indique en qué parte del plan de estudios se ubica la materia.</p>

                <ul className="mt-2 list-disc pl-4">
                  <li>1° Año - 1° Cuatrimestre</li>
                  <li>2° Año - 2° Cuatrimestre</li>
                  <li>5° Semestre</li>
                </ul>
              </>
            }
          />
          <Input
            id={`ubicacion-${index}`}
            {...register(
              `bloqueMultiple.${index}.ubicacionEnPlan`
            )}     
            placeholder="ej: Segundo cuatrimestre"
            aria-invalid={!!blockErrors?.ubicacionEnPlan}
            className={cn(
              "border-2 focus:border-primary",
              blockErrors?.ubicacionEnPlan
                ? "border-red-500"
                : "border-border"
            )}         
          />
          
          <div className="min-h-5">
            {blockErrors?.ubicacionEnPlan && (
              <p className="text-sm text-red-500" role="alert">
                {blockErrors.ubicacionEnPlan.message}
              </p>
            )}
          </div>
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
            <LabelWithTooltip
              label="Correlativas Fuertes"
              tooltip={
                <>
                  <p>Las asignaturas que deben estar aprobadas antes de cursar esta asignatura.</p>
                </>
              }
            />
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredMaterias?.map((materia: MateriaResponseDTO) => (
                <label
                  key={materia.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={block.correlativasFuertesIds?.includes(materia.id!)}
                    onChange={() => toggleCorrelativaFuerte(materia.id!)}
                    disabled={block.correlativasDebilesIds?.includes(materia.id!)}
                    className="rounded border-border"
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
              {filteredMaterias?.map((materia: MateriaResponseDTO) => (
                <label
                  key={materia.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={block.correlativasDebilesIds?.includes(materia.id!)}
                    onChange={() => toggleCorrelativaDebil(materia.id!)}
                    disabled={block.correlativasFuertesIds?.includes(materia.id!)}
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
          Contribución
        </Label>
        <Textarea
          id={`contribucion-${index}`}
          value={block.contribucion}
          placeholder="Describe la contribución a esta carrera..."
          className="border-border focus:border-primary min-h-16 resize-none"
          disabled
        />
      </div>

      <div className="space-y-2">
        <LabelWithTooltip
          label="Contenidos Mínimos *"
          tooltip={
            <>
              <p>Los contenidos mínimos que tienen que poseer el programa para dicha materia de acuerdo a...</p>
            </>
          }
        />
        <Textarea
          id={`contenidos-${index}`}
          {...register(
            `bloqueMultiple.${index}.contenidosMinimos`
          )}     
          placeholder="Lista los contenidos mínimos requeridos..."
          aria-invalid={!!blockErrors?.contenidosMinimos}
          className={cn(
            "border-2 focus:border-primary min-h-16 resize-none",
            blockErrors?.contenidosMinimos
              ? "border-red-500"
              : "border-border"
          )}
        />
        <div className="min-h-5">
          {blockErrors?.contenidosMinimos && (
            <p className="text-sm text-red-500" role="alert">
              {blockErrors.contenidosMinimos.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
