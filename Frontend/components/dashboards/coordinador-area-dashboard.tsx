"use client";

import { AlertCircle, User, Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgramaResponseReducedDTO, Rol } from "@/app/api/generated/model";
import {
  getGetDashboardResumenQueryKey,
  getListProgramasPendientesQueryKey,
  useGetDashboardResumen,
  useListProgramasPendientes,
  getMisAreasQueryKey,
  useMisAreas
} from "@/app/api/generated/client";
import { useRole } from "@/context/role-context";
import { useDept } from "@/context/dept-context";
import { ProgramasListReduced } from '@/components/pages/programas-list-reduced';
import { useEffect, useRef, useState } from "react";
import { useHeader } from "@/context/header-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { DashboardStats } from "../ui/cardsStatsCoordArea";


export function CoordinadorAreaDashboard() {
  const { activeDepartamento } = useDept()
  const { activeRole } = useRole();
  const { user } = useAuth();
  const {setHeader} = useHeader();
  const [page, setPage] = useState(0)
  const pageSize = 10;
  const deptId = activeDepartamento?.departamentoId ?? 0;
  const enabled = !!deptId && activeRole === 'COORDINADOR_AREA';
  const router = useRouter()

  const handleNavigate = (id: number) => {
    router.push(`/programas/${id}/revision/area`);
  };

  const pendientesRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setHeader({
      title: "Panel de coordinación de área",
      subtitle: "Programas de las áreas que coordina",
      badge: (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <User className="text-primary" size={20} />
          <span className="font-semibold text-primary">Bienvenido {user?.nombre}</span>
        </div>
      ),
      icon: Home
    })
  }, [user]);


  const resumen = useGetDashboardResumen(
    deptId,
    {
      rolActivo: activeRole as Rol,
    },
    {
      query: {
        enabled,
        staleTime: 1000 * 60 * 5,
        queryKey: getGetDashboardResumenQueryKey(
          deptId,
          {
            rolActivo: activeRole as Rol,
          }
        ),
      }, 
    }
  );

  const stats = resumen.data ?? undefined

  const programasQuery = useListProgramasPendientes(deptId, { rolActivo: 'COORDINADOR_AREA', page, size: pageSize }, { query: { enabled, queryKey: getListProgramasPendientesQueryKey(deptId, { rolActivo: 'COORDINADOR_AREA', page, size: pageSize }) } });
  const areasQuery = useMisAreas(deptId, { query: {
    enabled: enabled && !!user?.id,
    staleTime: 0,
    queryKey: [...getMisAreasQueryKey(deptId), { usuarioId: user?.id }],
  } });
  
  const programas: ProgramaResponseReducedDTO[] = programasQuery.data?.content ?? [];
  const totalPages = programasQuery.data?.totalPages ?? 0;
  const totalElements = programasQuery.data?.totalElements ?? 0;

  const handlePendingClick = () => {
    pendientesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!enabled || resumen.isLoading || programasQuery.isLoading || areasQuery.isLoading) {
    return <div className="p-8 max-w-7xl mx-auto" role="status">Cargando programas y áreas asignadas...</div>;
  }
  if (resumen.error || programasQuery.error || areasQuery.error) {
    return <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
        <AlertCircle className="text-red-600" size={24} />
        <p className="text-red-700">No se pudieron cargar los programas o las áreas asignadas.</p>
      </div>
    </div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {stats &&
        <DashboardStats stats={stats} areas={areasQuery.data ?? []} pendientesRevision={totalElements} onPendingClick={handlePendingClick}/>
      }
      <div
        ref={pendientesRef}
        className="scroll-mt-24"
      >
        <Card className="mb-6 mt-6">
          <CardHeader>
            <CardTitle>Programas pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgramasListReduced programas={programas} page={page} pageSize={pageSize} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} onRowClick={handleNavigate}/>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

