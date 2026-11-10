import { BookOpen } from 'lucide-react';

/** Indicador compartido por los paneles de gestión departamental. */
export function MateriasSinProgramaIndicador({ cantidad }: { cantidad: number }) {
  return <div role="group" aria-label="Materias sin programa del año actual"
    className="rounded-lg border border-blue-500 bg-blue-50 px-3 py-2 text-blue-700">
    <div className="mb-1 flex items-center gap-2">
      <BookOpen size={16} />
      <span className="text-[11px] font-medium">Materias sin programa del año actual</span>
    </div>
    <div className="text-xl font-bold ml-1">{cantidad}</div>
  </div>;
}
