"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"
import { Home, Building2, Users, FileText, DollarSign, Files, UserCheck, BarChart3, MessageSquare } from "lucide-react"

const pageNames: Record<string, { title: string; icon: React.ElementType }> = {
  "/": { title: "Dashboard", icon: Home },
  "/imoveis": { title: "Imóveis", icon: Building2 },
  "/proprietarios": { title: "Proprietários", icon: Users },
  "/inquilinos": { title: "Inquilinos", icon: UserCheck },
  "/contratos": { title: "Contratos", icon: FileText },
  "/pagamentos": { title: "Pagamentos", icon: DollarSign },
  "/documentos": { title: "Documentos", icon: Files },
  "/relatorios": { title: "Relatórios", icon: BarChart3 },
  "/interacoes": { title: "Interações", icon: MessageSquare },
}

export function Header() {
  const pathname = usePathname()
  const currentPage = pageNames[pathname] || { title: "Dashboard", icon: Home }
  const Icon = currentPage.icon

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-black/10 bg-white transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-base font-semibold">{currentPage.title}</h1>
        </div>
        <Separator orientation="vertical" className="mx-2 h-4" />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex hover:bg-black/5">
            <a
              href="https://github.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
