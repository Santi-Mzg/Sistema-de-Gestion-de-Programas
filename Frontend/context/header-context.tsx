"use client"

import { LucideIcon } from "lucide-react"
import { createContext, useContext, useState, ReactNode } from "react"

interface HeaderContextType {
  title: string
  subtitle: string
  icon?: LucideIcon
  badge?: ReactNode
  setHeader: (config: { title: string; subtitle?: string;  icon?: LucideIcon; badge?: ReactNode }) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerConfig, setHeaderConfig] = useState<{
    title: string
    subtitle: string
    icon?: LucideIcon
    badge?: ReactNode
  }>({
    title: "",
    subtitle: "",
  })

  const setHeader = ({ title, subtitle, icon, badge }: { title: string; subtitle?: string; icon?: LucideIcon; badge?: ReactNode }) => {
    setHeaderConfig({
      title,
      subtitle: subtitle ?? "Gestión Académica",
      icon,
      badge,
    })
  }

  return (
    <HeaderContext.Provider value={{ ...headerConfig, setHeader }}>
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeader = () => {
  const context = useContext(HeaderContext)
  if (!context) throw new Error("useHeader debe usarse dentro de un HeaderProvider")
  return context
}