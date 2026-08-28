"use client"

import {
  BookOpen,
  GraduationCap,
  Layers3,
  Users,
  UserRound,
  ShieldCheck,
  RefreshCw,
  CircleAlert,
  CircleCheckBig,
  ClipboardList,
  UserCog,
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
import { DashboardResumenDTO } from "@/app/api/generated/model"

interface DashboardStatsProps {
  stats: DashboardResumenDTO
  onPendingClick?: () => void
}

export function DashboardStats( { stats, onPendingClick }: DashboardStatsProps) {

  const programasEnCurso = [
    {
      estado: "Administración",
      cantidad: stats.pendienteAdministracion,
      color: "#f59e0b",
    },
    {
      estado: "Docente",
      cantidad: stats.pendienteDocente,
      color: "#3b82f6",
    },
    {
      estado: "Comisiones",
      cantidad: stats.pendienteComisiones,
      color: "#8b5cf6",
    },
        {
      estado: "Secretaría",
      cantidad: stats.pendienteSecretaria,
      color: "#06b6d4",
    },
  ]

  const totalEnCurso = (stats.programasTotales ?? 0) - (stats.programasVigentes ?? 0)

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">

      {/* OFERTA ACADÉMICA */}
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
              <GraduationCap size={18} />
            </div>

            Resumen del departamento
          </CardTitle>

          <CardDescription className="text-[13px]">
            Oferta académica y miembros
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-1">
          {/* Dato principal */}
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-sky-700">
              {stats.programasVigentes ?? 0}
            </span>

            <span className="text-[13px] text-muted-foreground">
              programas vigentes
            </span>
          </div>

          {/* Métricas secundarias */}
          <div className="grid grid-cols-3 gap-2 border-t pt-4 mt-4">
            <MiniStat
              icon={<Layers3 size={14} />}
              value={stats.areas ?? 0}
              label="Áreas"
            />

            <MiniStat
              icon={<GraduationCap size={14} />}
              value={stats.carreras ?? 0}
              label="Carreras"
            />

            <MiniStat
              icon={<BookOpen size={14} />}
              value={stats.materias ?? 0}
              label="Materias"
            />

            <MiniStat
              icon={<Users size={14} />}
              value={stats.usuarios ?? 0}
              label="Usuarios"
            />

            <MiniStat
              icon={<UserRound size={14} />}
              value={stats.docentes ?? 0}
              label="Docentes"
            />

            <MiniStat
              icon={<UserCog size={14} />}
              value={stats.administrativos ?? 0}
              label="Administrativos"
            />
          </div>
        </CardContent>
      </Card>

      {/* PROGRAMAS EN CURSO */}
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <RefreshCw size={18} />
            </div>

            Programas en curso
          </CardTitle>

          <CardDescription className="text-[13px]">
            Distribución según etapa actual
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">

          <div className="flex flex-col items-center gap-3">

            {/* DONUT */}
            <div className="relative h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programasEnCurso}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={66}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {programasEnCurso.map((item) => (
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
                  {totalEnCurso}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  en curso
                </span>
              </div>
            </div>

            {/* LEYENDA */}
            <div className="grid min-w-0 flex-1 flex-col grid-cols-2 gap-2 gap-x-4">
              {programasEnCurso.map((item) => (
                <div
                  key={item.estado}
                  className="flex items-center justify-between gap-2 text-[13px]"
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
        </CardContent>
      </Card>

      <Card
        onClick={onPendingClick}
        className={
          `h-full flex flex-col ${
          stats.pendienteSecretaria ?? 0 > 0
            ? "border-amber-500 bg-amber-50/30 shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.04] hover:shadow-2xl  hover:border-amber-500  hover:bg-amber-50/70 hover:ring-4 hover:ring-amber-400/20active:translate-y-0 active:scale-[0.98] "
            : "border-emerald-500 bg-emerald-50/30 shadow-sm"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div
              className={
                stats.pendienteSecretaria ?? 0 > 0
                  ? "rounded-lg bg-amber-50 p-2 text-amber-700"
                  : "rounded-lg bg-emerald-50 p-2 text-emerald-700"
              }
            >
              {stats.pendienteSecretaria ?? 0 > 0 ? (
                <CircleAlert size={18} />
              ) : (
                <CircleCheckBig size={18} />
              )}
            </div>

            Requieren mi atención
          </CardTitle>

          <CardDescription className="text-[13px]">
            Programas que necesitan una acción tuya
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col">
          <div className="mb-2 flex items-baseline gap-2">
            <div
              className={
                stats.pendienteSecretaria ?? 0 > 0
                  ? "text-3xl font-bold text-amber-700"
                  : "text-3xl font-bold text-emerald-700"
              }
            >
              {stats.pendienteSecretaria ?? 0}
            </div>

            <p className="text-[13px] text-muted-foreground">
              {stats.pendienteSecretaria ?? 0 > 0
                ? stats.pendienteSecretaria == 1 
                ? "Programa pendiente de tu intervención"
                : "Programas pendientes de tu intervención"
                : "No tenés acciones pendientes"}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2 border-t pt-2">
            <StatBox
              label="A Revisar"
              value={stats.pendienteSecretaria ?? 0}
              icon={<ClipboardList size={16} />}
              className="border-sky-500 bg-sky-50 text-sky-700"
            />
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

      <div className="text-xl font-bold ml-1">
        {value}
      </div>
    </div>
  )
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="rounded-md bg-blue-50/60 px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-blue-600">
          {icon}
        </span>

        <span className="text-base font-bold text-blue-700">
          {value}
        </span>
      </div>

      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}