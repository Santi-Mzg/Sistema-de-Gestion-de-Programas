"use client";

import { useParams } from 'next/navigation';
import { useGetPrograma, getGetProgramaQueryKey } from '@/app/api/generated/client';
import { useRole } from '@/context/role-context';
import { SyllabusSecretariaInicialForm } from '@/components/forms/programa-secretaria-inicial-form';

export default function CargaSecretaria() {
  const { id } = useParams<{ id: string }>();
  const { activeRole } = useRole();
  const programa = useGetPrograma(Number(id), { query: { queryKey: getGetProgramaQueryKey(Number(id)), enabled: activeRole === 'SECRETARIA' } });
  if (activeRole !== 'SECRETARIA') return <p className="p-8 text-destructive">Seleccione el rol Secretaría para esta acción.</p>;
  if (programa.isLoading) return <p className="p-8">Cargando programa...</p>;
  if (programa.error || !programa.data) return <p className="p-8 text-destructive">No se pudo cargar el programa.</p>;
  if (['PENDIENTE_DE_SECRETARIA_INICIAL', 'RECHAZADO_A_SECRETARIA'].includes(programa.data.estado ?? ''))
    return <SyllabusSecretariaInicialForm id={Number(id)} />;
}
