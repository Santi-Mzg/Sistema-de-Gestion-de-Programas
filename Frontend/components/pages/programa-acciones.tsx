"use client"

import { useRef, type ReactNode } from 'react'
import { ClipboardList, EllipsisVertical, Eye, FileDown, FolderClock, History, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ProgramaAccionesProps {
  descripcion: string
  revision?: boolean
  onContinuar?: () => void
  onVer?: () => void
  onHistorial?: () => void
  onVersiones?: () => void
  onPdf?: () => void
  onEliminar?: () => void
  eliminarDeshabilitado?: boolean
}

function AccionIcono({ texto, descripcion, icono, onClick }: {
  texto: string; descripcion: string; icono: ReactNode; onClick: () => void
}) {
  return <Tooltip>
    <TooltipTrigger asChild>
      <Button type="button" size="icon" variant="outline" className="h-8 w-8"
        onClick={onClick} aria-label={`${texto} de ${descripcion}`}>
        {icono}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{texto}</TooltipContent>
  </Tooltip>
}

/** Presentación de acciones; los permisos y destinos se resuelven en cada lista. */
export function ProgramaAcciones({ descripcion, revision = false, onContinuar, onVer, onHistorial, onVersiones, onPdf, onEliminar, eliminarDeshabilitado }: ProgramaAccionesProps) {
  const abriendoConfirmacion = useRef(false)
  const textoPrincipal = revision ? 'Revisar' : 'Completar'
  const principal = onContinuar && <Button type="button" size="sm" variant="outline"
    className="h-8 w-28 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
    aria-label={`${textoPrincipal} programa de ${descripcion}`} onClick={onContinuar}>
    {revision ? <ClipboardList size={16} /> : <Pencil size={16} />}{textoPrincipal}
  </Button>

  if (!onVer && !onHistorial && !onVersiones && !onPdf && !onEliminar) {
    return <div className="flex justify-end">{principal}</div>
  }

  return <TooltipProvider delayDuration={250}>
    <div className="ml-auto flex w-max flex-nowrap items-center justify-end gap-1">
      {principal}
      {onPdf && <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" size="sm" variant="outline" className="h-8 w-[3.75rem] px-2"
            onClick={onPdf} aria-label={`Generar PDF de ${descripcion}`}><FileDown size={16} />PDF</Button>
        </TooltipTrigger>
        <TooltipContent>Generar PDF</TooltipContent>
      </Tooltip>}
      {onVer && <AccionIcono texto="Ver programa" descripcion={descripcion} icono={<Eye size={16} />} onClick={onVer} />}
      {(onHistorial || onVersiones || onEliminar) && <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="icon" variant="outline" className="h-8 w-8"
            aria-label={`Más acciones de ${descripcion}`} title="Más acciones"><EllipsisVertical size={16} /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={event => {
          if (abriendoConfirmacion.current) {
            event.preventDefault()
            abriendoConfirmacion.current = false
          }
        }}>
          {onHistorial && <DropdownMenuItem onSelect={onHistorial}><History size={16} />Historial de estados</DropdownMenuItem>}
          {onVersiones && <DropdownMenuItem onSelect={onVersiones}><FolderClock size={16} />Programas de otros años</DropdownMenuItem>}
          {onEliminar && <>
            {(onHistorial || onVersiones) && <DropdownMenuSeparator />}
            <DropdownMenuItem variant="destructive" disabled={eliminarDeshabilitado} onSelect={() => {
              abriendoConfirmacion.current = true
              onEliminar()
            }}
              aria-label={`Eliminar programa de ${descripcion}`}><Trash2 size={16} />Eliminar programa</DropdownMenuItem>
          </>}
        </DropdownMenuContent>
      </DropdownMenu>}
    </div>
  </TooltipProvider>
}
