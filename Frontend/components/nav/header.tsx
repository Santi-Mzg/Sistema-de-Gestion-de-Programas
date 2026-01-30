"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { ArrowLeft } from "lucide-react"
import { useHeader } from "@/context/header-context"

export function Header() {
  const { title, subtitle, icon: Icon, badge } = useHeader()
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === "/"

  return (
    <header className="w-full shrink-0 bg-background border-b border-border">
      <div className="bg-linear-to-r from-primary/5 via-accent/5 to-background p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 min-w-0">
            {!isHome && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
              >
                <ArrowLeft size={22} />
              </Button>
            )}

            {Icon && (
              <div className="hidden sm:flex p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                <Icon size={24} />
              </div>
            )}
            
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
                {title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {badge && <div className="hidden lg:block">{badge}</div>}

            <div className="flex items-center border-l pl-6 border-border">
              <img src="/logo_uns_v1.png" alt="Logo UNS" className="h-18 w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}