"use client"

import { useState, type Ref } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import type { MateriaResponseDTO } from "@/app/api/generated/model"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formComboboxStyles } from "@/lib/form-field-styles"

interface MateriaProgramaSelectorProps {
  materias: MateriaResponseDTO[]
  value?: number
  onChange: (materia: MateriaResponseDTO) => void
  buttonRef?: Ref<HTMLButtonElement>
  error?: string
}

/** Selector de materia con la presentación existente del formulario de creación. */
export function MateriaProgramaSelector({ materias, value, onChange, buttonRef, error }: MateriaProgramaSelectorProps) {
  const [open, setOpen] = useState(false)
  const seleccionada = materias.find(materia => materia.id === value)
  return <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button ref={buttonRef} id="materia" type="button" variant="outline" role="combobox"
          aria-expanded={open} aria-invalid={!!error} aria-describedby={error ? 'materia-error' : undefined}
          className={cn(formComboboxStyles, "border-border")}>
          <span className="min-w-0 flex-1 truncate text-left" title={seleccionada?.nombre}>
            {seleccionada?.nombre ?? 'Seleccionar materia...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar materia..." />
          <CommandList className="pointer-events-auto">
            <CommandEmpty>No se encontró la materia.</CommandEmpty>
            <CommandGroup>
              {materias.map(materia => <CommandItem key={materia.id} value={`${materia.nombre} ${materia.codigo}`}
                onSelect={() => { onChange(materia); setOpen(false) }}>
                <Check className={cn('mr-2 h-4 w-4', value === materia.id ? 'opacity-100' : 'opacity-0')} />
                {materia.nombre} ({materia.codigo})
              </CommandItem>)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <div className="min-h-5">{error && <p id="materia-error" className="text-sm text-red-500">{error}</p>}</div>
  </>
}
