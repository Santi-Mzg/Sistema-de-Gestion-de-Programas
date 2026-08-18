"use client"

import { getListCarrerasDepartamentoQueryKey, useListCarrerasDepartamento } from "@/app/api/generated/client";
import { CarreraResponseDTO, UsuarioDepartamentoDTORolesItem } from "@/app/api/generated/model";
import { CarrerasList } from "@/components/pages/carreras-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDept } from "@/context/dept-context";
import { useRole } from "@/context/role-context";
import { AlertCircle, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Carreras() {
    const { activeDepartamento } = useDept()
    const { activeRole } = useRole()
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

    const carrerasQuery = useListCarrerasDepartamento(activeDepartamento?.departamentoId ?? 0, 
      {
        page,
        size: pageSize,
        search: search || undefined
      },
      {
        query: {
          enabled: !!activeDepartamento?.departamentoId,
          staleTime: 1000 * 60 * 5,
          queryKey: getListCarrerasDepartamentoQueryKey(
            activeDepartamento?.departamentoId,
            {
              page,
              size: pageSize,
              search: search || undefined
            }
          )
        }
      }
    );
    
    const carreras: CarreraResponseDTO[] | undefined = carrerasQuery.data?.content;
    const totalPages: number = carrerasQuery.data?.totalPages ?? 0;
    const totalElements: number = carrerasQuery.data?.totalElements ?? 0;

    const deptId = activeDepartamento?.departamentoId
    const isReady = !!deptId && carrerasQuery.isSuccess;


    if (carrerasQuery.error) {
      return (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-700">Error al obtener las carreras</p>
          </div>
        </div>
      )
    }


    return (
      <>
      <div className="mb-8 flex md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-12 py-3 text-base border-2 border-border rounded-xl"
          />
        </div>
        {(activeRole === UsuarioDepartamentoDTORolesItem.ADMINISTRACION || 
            activeRole === UsuarioDepartamentoDTORolesItem.SECRETARIA || 
            activeRole === UsuarioDepartamentoDTORolesItem.DIRECCION_ADMINISTRATIVA || 
            activeRole === UsuarioDepartamentoDTORolesItem.SYSTEM_ADMIN) &&
          <Button size="lg"
                  variant="outline"
                  onClick={() => router.push(`/carreras/crear`)}
                  className="border-2 hover:bg-primary hover:text-primary-foreground">
            <Plus size={16} className="mr-1" />
            Crear Carrera
          </Button>
        }
      </div>
        {!isReady && (
          <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-yellow-700">Cargando carreras...</p>
            </div>  
          </div>
        ) || (
          <CarrerasList 
            carreras={carreras}
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
