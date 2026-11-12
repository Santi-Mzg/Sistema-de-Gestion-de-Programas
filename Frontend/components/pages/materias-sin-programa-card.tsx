"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, Plus, Search } from 'lucide-react';
import type { Rol } from '@/app/api/generated/model';
import { getListMateriasSinProgramaQueryKey, useListMateriasSinPrograma } from '@/app/api/generated/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageNavigation } from '@/components/nav/page-nav';

export function MateriasSinProgramaCard({ deptId, rol }: { deptId: number; rol: Rol }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const params = { page, size: 5, search };
  const query = useListMateriasSinPrograma(deptId, params, { query: {
    enabled: !!deptId && ['ADMINISTRACION', 'SECRETARIA', 'DIRECCION_ADMINISTRATIVA', 'SYSTEM_ADMIN'].includes(rol),
    queryKey: [...getListMateriasSinProgramaQueryKey(deptId, params), { rol }],
  } });
  const materias = query.data?.content ?? [];

  return <Card className="mb-6 mt-6">
    <CardHeader><CardTitle>Materias sin programa del año actual</CardTitle></CardHeader>
    <CardContent>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Buscar materias sin programa" placeholder="Buscar por nombre o código..."
          value={search} className="pl-10" onChange={event => { setSearch(event.target.value); setPage(0); }} />
      </div>
      {query.isLoading ? <p className="py-6 text-center text-muted-foreground">Cargando materias...</p>
        : query.isError ? <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
          <AlertCircle size={20} /><p>No se pudieron cargar las materias sin programa.</p>
          <Button variant="outline" onClick={() => query.refetch()}>Reintentar</Button>
        </div>
        : <>
          <div className="overflow-x-auto border rounded-xl shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-primary text-primary-foreground"><tr>
                <th scope="col" className="px-3 py-2 text-left font-semibold">Materia</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold">Código</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold">Área</th>
                <th scope="col" className="px-3 py-2 text-center font-semibold">Acciones</th>
              </tr></thead>
              <tbody className="divide-y">
                {materias.length ? materias.map(materia => <tr key={materia.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-medium">{materia.nombre}</td>
                  <td className="px-3 py-2 text-muted-foreground">{materia.codigo}</td>
                  <td className="px-3 py-2 text-muted-foreground">{materia.area}</td>
                  <td className="px-3 py-2 text-center"><div className="flex flex-wrap items-center justify-center gap-2">
                    {rol === 'ADMINISTRACION' && !!materia.id && <Button asChild variant="outline" size="sm">
                      <Link href={`/programas/crear?materiaId=${materia.id}`} aria-label={`Crear programa de ${materia.nombre}`}>
                        <Plus size={16} />Crear programa
                      </Link>
                    </Button>}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/materias/${materia.id}`} aria-label={`Ver materia ${materia.nombre}`}><Eye size={16} /></Link>
                    </Button>
                  </div></td>
                </tr>) : <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  {search ? 'No se encontraron materias con esa búsqueda.' : 'Todas las materias del departamento tienen un programa para el año actual.'}
                </td></tr>}
              </tbody>
            </table>
          </div>
          <PageNavigation page={page} pageSize={5} totalPages={query.data?.totalPages ?? 0}
            totalElements={query.data?.totalElements ?? 0} onPageChange={setPage} itemLabel="materias" />
        </>}
    </CardContent>
  </Card>;
}
