// app/(dashboard)/layout.tsx
import { Header } from "@/components/nav/header"
import { Sidebar } from "@/components/nav/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        
        <Header />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  )
}