"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RechazoDialog } from './rechazo-dialog';
import { useRole } from '@/context/role-context';
import type { Rol } from '@/app/api/generated/model';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  hayCambios: boolean;
  onConfirm: (destino: Rol, justificacion: string, guardar: boolean) => void;
};

/** La elección es local: solo la confirmación del rechazo ejecuta una escritura. */
export function RechazoConCambiosDialog({ open, onOpenChange, onConfirm, isLoading, hayCambios }: Props) {
  const [eleccion, setEleccion] = useState<boolean | null>(null);
  const [previousOpen, setPreviousOpen] = useState(open);
  const { activeRole } = useRole();
  if (previousOpen !== open) {
    setPreviousOpen(open);
    if (open) setEleccion(null);
  }
  const cancelar = () => { if (!isLoading) onOpenChange(false); };
  return <>
    <Dialog open={open && hayCambios && eleccion === null} onOpenChange={value => { if (!value) cancelar(); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg">
        <DialogHeader className="min-w-0 break-words pr-6">
          <DialogTitle className="leading-snug">¿Guardar los cambios antes de rechazar?</DialogTitle>
          <DialogDescription>La elección se aplicará cuando confirme el destino y la justificación. Si cancela, conserva su trabajo y el borrador.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="min-w-0 flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button type="button" disabled={isLoading} className="h-auto min-h-9 w-full whitespace-normal break-words py-2" onClick={() => setEleccion(true)}>Guardar cambios y continuar</Button>
          <Button type="button" disabled={isLoading} className="h-auto min-h-9 w-full whitespace-normal break-words py-2" variant="outline" onClick={() => setEleccion(false)}>Descartar cambios y continuar</Button>
          <Button type="button" disabled={isLoading} className="h-auto min-h-9 w-full whitespace-normal break-words py-2" variant="outline" onClick={cancelar}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <RechazoDialog open={open && (!hayCambios || eleccion !== null)} onOpenChange={value => { if (!value) cancelar(); }}
      destinos={activeRole === 'SECRETARIA' ? ['ADMINISTRACION'] : undefined}
      isLoading={isLoading} onConfirm={(destino, justificacion) => onConfirm(destino, justificacion, hayCambios && eleccion === true)} />
  </>;
}
