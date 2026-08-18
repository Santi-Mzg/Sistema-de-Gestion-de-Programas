"use client"

import {
  Users,
  UserRound,
  ShieldCheck,
  RefreshCw,
  CircleAlert,
  CircleCheckBig,
  BookOpen,
  GraduationCap,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts"
import { useDept } from "@/context/dept-context"

interface DashboardStatsProps {
    programasEnCurso: number
    enAdministracion: number
    enDocente: number
    enComision: number
    enSecretaria: number
    onPendingClick?: () => void
}

export function DashboardStats( { 
    programasEnCurso,
    enAdministracion,
    enDocente,
    enComision,
    enSecretaria,
    onPendingClick
 }: DashboardStatsProps) {

  const { activeDepartamento } = useDept();
  const etapas = [
    {
      estado: "Administración",
      cantidad: enAdministracion,
      color: "#f59e0b",
    },
    {
      estado: "Docente",
      cantidad: enDocente,
      color: "#3b82f6",
    },
    {
      estado: "Comisiones",
      cantidad: enComision,
      color: "#8b5cf6",
    },
        {
      estado: "Secretaría",
      cantidad: enSecretaria,
      color: "#06b6d4",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

      {/* OFERTA ACADÉMICA */}
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <GraduationCap size={18} />
            </div>

            Carreras asignadas
          </CardTitle>

          <CardDescription className="text-xs">
            Carreras bajo tu coordinación
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-700">
              {activeDepartamento?.carrerasComoComision?.length ?? 0}
            </span>

            <span className="text-xs text-muted-foreground">
              carreras
            </span>
          </div>

          <div className="space-y-2 border-t pt-3">
            {activeDepartamento?.carrerasComoComision?.map((carrera) => (
              <div
                key={carrera}
                className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                  <GraduationCap size={15} />
                </div>

                <span className="text-sm font-medium text-foreground">
                  {carrera}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PROGRAMAS EN CURSO */}
      <Card className="shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <RefreshCw size={18} />
            </div>

            Programas en curso
          </CardTitle>

          <CardDescription className="text-xs">
            Distribución según etapa actual
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">

          <div className="flex items-center gap-3">

            {/* DONUT */}
            <div className="relative h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={etapas}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={66}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {etapas.map((item) => (
                      <Cell
                        key={item.estado}
                        fill={item.color}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* TOTAL CENTRAL */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">
                  {programasEnCurso}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  en curso
                </span>
              </div>
            </div>

            {/* LEYENDA */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {etapas.map((item) => (
                <div
                  key={item.estado}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span className="truncate text-muted-foreground">
                      {item.estado}
                    </span>
                  </div>

                  <span className="font-semibold">
                    {item.cantidad}
                  </span>
                </div>
              ))}
            </div>

          </div>

          <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
            <span className="font-medium">
              Total de programas en curso
            </span>

            <span className="font-bold text-blue-600">
               {programasEnCurso}
            </span>
          </div>

        </CardContent>
      </Card>

      {/* REQUIEREN MI ATENCIÓN */}
      <Card
        onClick={onPendingClick}
        className={`h-full flex flex-col ${
            enComision ?? 0 > 0
            ? "border-amber-500 bg-amber-50/30 shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.04] hover:shadow-2xl  hover:border-amber-500  hover:bg-amber-50/70 hover:ring-4 hover:ring-amber-400/20active:translate-y-0 active:scale-[0.98] "
            : "border-emerald-500 bg-emerald-50/30 shadow-sm"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div
              className={
                enComision ?? 0 > 0
                  ? "rounded-lg bg-amber-50 p-2 text-amber-700"
                  : "rounded-lg bg-emerald-50 p-2 text-emerald-700"
              }
            >
              {enComision ?? 0 > 0 ? (
                <CircleAlert size={18} />
              ) : (
                <CircleCheckBig size={18} />
              )}
            </div>

            Requieren mi atención
          </CardTitle>

          <CardDescription className="text-[13px]">
            Programas pendientes de tu intervención
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-2">
          <div className="mt-auto mb-4">
            <div
              className={
                enComision ?? 0 > 0
                  ? "text-3xl font-bold text-amber-700"
                  : "text-3xl font-bold text-emerald-700"
              }
            >
              {enComision ?? 0}
            </div>

            <p className="text-[13px] text-muted-foreground">
              {enComision ?? 0 > 0
                ? "Programas pendientes"
                : "No tienes acciones pendientes"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatBox({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: number
  icon: React.ReactNode
  className: string
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${className}`}
    >
      <div className="mb-1 flex items-center gap-2">
        {icon}

        <span className="text-[11px] font-medium">
          {label}
        </span>
      </div>

      <div className="text-xl font-bold">
        {value}
      </div>
    </div>
  )
}