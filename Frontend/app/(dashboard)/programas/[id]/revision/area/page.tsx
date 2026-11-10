"use client";

import { useParams } from 'next/navigation';
import { useGetPrograma, getGetProgramaQueryKey } from '@/app/api/generated/client';
import { useRole } from '@/context/role-context';
import { SyllabusSecretariaForm } from '@/components/forms/programa-secretaria-form';

export default function RevisionArea() {
  const { id } = useParams<{ id: string }>();
  const { activeRole } = useRole();
  const programa = useGetPrograma(Number(id), { query: { queryKey: getGetProgramaQueryKey(Number(id)), enabled: activeRole === 'COORDINADOR_AREA' } });
  if (activeRole !== 'COORDINADOR_AREA') return <p className="p-8 text-destructive">Seleccione el rol Coordinador de Área.</p>;
  if (programa.isLoading) return <p className="p-8">Cargando programa...</p>;
  if (programa.error) return <p className="p-8 text-destructive">No tiene acceso al programa o no pudo cargarse.</p>;
  if (programa.data?.estado !== 'PENDIENTE_DE_COORDINACION_AREA') return <p className="p-8">El programa ya no está pendiente de revisión de Área.</p>;
  return <SyllabusSecretariaForm id={Number(id)} />;
}
