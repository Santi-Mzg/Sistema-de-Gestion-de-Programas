"use client"

import {
  getListAreasDepartamentoQueryKey,
  useListAreasDepartamento,
  getMisAreasQueryKey,
  useMisAreas
} from "@/app/api/generated/client";
import { AreaResponseDTO, Rol } from "@/app/api/generated/model";
import { AreasList } from "@/components/pages/areas-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDept } from "@/context/dept-context";
import { useRole } from "@/context/role-context";
import { AlertCircle, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { useAuth } from '@/context/auth-context';

export default function Areas() {
    const { activeDepartamento } = useDept()
    const { activeRole } = useRole()
    const { user } = useAuth()
    const router = useRouter()
    const [page, setPage] = useState(0)
    const pageSize = 10
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")

    useEffect(() => {
      const timeout = setTimeout(() => {
        setSearch(searchInput.trim())
        setPage(0)
      }, 1000)

      return () => clearTimeout(timeout)
    }, [searchInput])

    const esCoordinadorArea = activeRole === 'COORDINADOR_AREA';
    const misAreasQuery = useMisAreas(activeDepartamento?.departamentoId ?? 0, { query: {
      enabled: !!activeDepartamento?.departamentoId && !!user?.id && esCoordinadorArea,
      staleTime: 0,
      queryKey: [...getMisAreasQueryKey(activeDepartamento?.departamentoId), { usuarioId: user?.id }],
    } });
    const areasQuery = useListAreasDepartamento(activeDepartamento?.departamentoId ?? 0,
      {
        page,
        size: pageSize,
        search: search || undefined
      },
      {
        query: {
          enabled: !!activeDepartamento?.departamentoId && !!activeRole && !esCoordinadorArea,
          staleTime: 1000 * 60 * 5,
          queryKey: getListAreasDepartamentoQueryKey(
            activeDepartamento?.departamentoId,
            {
              page,
              size: pageSize,
              search: search || undefined
            },
          )
        }
      }
    );

    const propiasFiltradas = useMemo(() => (misAreasQuery.data ?? []).filter(a => (a.nombre ?? '').toLowerCase().includes(search.toLowerCase())), [misAreasQuery.data, search]);
    const areas: AreaResponseDTO[] | undefined = esCoordinadorArea ? propiasFiltradas.slice(page * pageSize, (page + 1) * pageSize) : areasQuery.data?.content;
    const totalPages: number = esCoordinadorArea ? Math.ceil(propiasFiltradas.length / pageSize) : areasQuery.data?.totalPages ?? 0;
    const totalElements: number = esCoordinadorArea ? propiasFiltradas.length : areasQuery.data?.totalElements ?? 0;

    const isReady = !!activeDepartamento?.departamentoId && (esCoordinadorArea ? misAreasQuery.isSuccess : areasQuery.isSuccess);

    if (esCoordinadorArea ? misAreasQuery.error : areasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las áreas</p>
          </div>
        </div>
      )
    }


    return (
      <>
      {/* Search and Filters Section */}
        <div className="mb-8 flex md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por nombre..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12 py-3 text-base border-2 border-border rounded-xl"
            />
          </div>
          {(activeRole === Rol.SECRETARIA ||
              activeRole === Rol.DIRECCION_ADMINISTRATIVA ||
              activeRole === Rol.SYSTEM_ADMIN) &&
            <Button size="lg"
                    variant="outline"
                    onClick={() => router.push(`/areas/crear`)}
                    className="border-2 hover:bg-primary hover:text-primary-foreground">
              <Plus size={16} className="mr-1" />
              Crear área
            </Button>
          }
        </div>
        {!isReady && (
          <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-yellow-700">Cargando áreas...</p>
            </div>
          </div>
        ) || (
          <AreasList
            areas={areas}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setPage}
          />
        )}
      </>
    )
}
