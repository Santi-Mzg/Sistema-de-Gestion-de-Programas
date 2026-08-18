"use client"

import {
  BookOpen,
  CircleAlert,
  CircleCheckBig,
  ClipboardList,
  RefreshCw,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardStatsProps {
    programasAsignados: number
    programasVigentes: number
    programasEnCurso: number
    enAdministracion: number
    enDocente: number
    enComision: number
    enSecretaria: number
    nuevosParaCompletar: number
    rechazadosAlDocente: number
    onPendingClick?: () => void
}

export function DashboardStats({
    programasAsignados,
    programasVigentes,
    programasEnCurso,
    enAdministracion,
    enDocente,
    enComision,
    enSecretaria,
    nuevosParaCompletar,
    rechazadosAlDocente,
    onPendingClick
}: DashboardStatsProps) {
  const etapas = [
    {
      label: "Administración",
      value: enAdministracion ?? 0,
      color: "bg-amber-500",
    },
    {
      label: "Mi revisión",
      value: enDocente ?? 0,
      color: "bg-blue-500",
    },
    {
      label: "Comisión",
      value: enComision ?? 0,
      color: "bg-violet-500",
    },
    {
      label: "Secretaría",
      value: enSecretaria ?? 0,
      color: "bg-sky-500",
    },
  ]

  const totalEtapas =
    etapas.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

      {/* MIS PROGRAMAS */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
              <BookOpen size={18} />
            </div>

            Mis programas
          </CardTitle>

          <CardDescription className="text-[13px]">
            Programas asignados en el año actual
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="mb-4">
            <div className="text-3xl font-bold text-sky-700">
              {programasAsignados ?? 0}
            </div>

            <p className="text-[13px] text-muted-foreground">
              Programas asignados
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t pt-3">
            <StatBox
              label="Vigentes"
              value={programasVigentes ?? 0}
              icon={<CircleCheckBig size={16} />}
              className="border-emerald-500 bg-emerald-50 text-emerald-700"
            />

            <StatBox
              label="En curso"
              value={programasEnCurso ?? 0}
              icon={<RefreshCw size={16} />}
              className="border-sky-500 bg-sky-50 text-sky-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* ESTADO DE MIS PROGRAMAS */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <ClipboardList size={18} />
            </div>

            Estado de mis programas
          </CardTitle>

          <CardDescription className="text-[13px]">
            Distribución según la etapa actual
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="mb-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {etapas.map((etapa) => {
                const percentage =
                  totalEtapas > 0
                    ? (etapa.value / totalEtapas) * 100
                    : 0

                return (
                  <div
                    key={etapa.label}
                    className={etapa.color}
                    style={{
                      width: `${percentage}%`,
                    }}
                    title={`${etapa.label}: ${etapa.value}`}
                  />
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {etapas.map((etapa) => (
              <div
                key={etapa.label}
                className="flex items-center justify-between gap-2 text-[13px]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${etapa.color}`}
                  />

                  <span className="truncate text-muted-foreground">
                    {etapa.label}
                  </span>
                </div>

                <span className="font-semibold">
                  {etapa.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-2 text-[13px]">
            <span className="font-medium">
              Programas en curso
            </span>

            <span className="font-bold text-blue-700">
              {programasEnCurso ?? 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* REQUIEREN MI ATENCIÓN */}
      <Card
        onClick={onPendingClick}
        className={`h-full flex flex-col ${
            enDocente > 0
            ? "border-amber-500 bg-amber-50/30 shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.04] hover:shadow-2xl  hover:border-amber-500  hover:bg-amber-50/70 hover:ring-4 hover:ring-amber-400/20active:translate-y-0 active:scale-[0.98] "
            : "border-emerald-500 bg-emerald-50/30 shadow-sm"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div
              className={
                enDocente > 0
                  ? "rounded-lg bg-amber-50 p-2 text-amber-700"
                  : "rounded-lg bg-emerald-50 p-2 text-emerald-700"
              }
            >
              {enDocente > 0 ? (
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
          <div className="mb-4">
            <div
              className={
                enDocente > 0
                  ? "text-3xl font-bold text-amber-700"
                  : "text-3xl font-bold text-emerald-700"
              }
            >
              {enDocente ?? 0}
            </div>

            <p className="text-[13px] text-muted-foreground">
              {enDocente > 0
                ? "Programas pendientes"
                : "No tenés acciones pendientes"}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-3">  
            <StatBox
              label="Nuevos"
              value={nuevosParaCompletar ?? 0}
              icon={<BookOpen size={16} />}
              className="border-blue-500 bg-blue-50 text-blue-700"
            />

            <StatBox
              label="Rechazados"
              value={rechazadosAlDocente ?? 0}
              icon={<CircleAlert size={16} />}
              className="border-amber-500 bg-amber-50 text-amber-700"
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

      <div className="text-xl font-bold">
        {value}
      </div>
    </div>
  )
}