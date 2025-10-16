"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname, useRouter } from "next/navigation"
import { Plus, Home, Building2, Users, FileText, DollarSign, Files, UserCheck, BarChart3, MessageSquare, ChevronLeft } from "lucide-react"

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

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()

  // Detecta se está em uma sub-rota (formulário, detalhes, etc)
  const pathParts = pathname.split("/").filter(Boolean)
  const isSubRoute = pathParts.length > 1
  const basePath = `/${pathParts[0]}`
  const subRouteName = pathParts[1]

  const currentPage = pageNames[isSubRoute ? basePath : pathname] || { title: "Dashboard", icon: Home }
  const Icon = currentPage.icon

  // Mapeamento de nomes de sub-rotas
  const subRouteNames: Record<string, string> = {
    "novo": "Novo",
    "editar": "Editar",
  }

  // Configuração de ações por página - agora usando router.push diretamente
  const getActionButton = () => {
    if (isSubRoute) return null

    const actions: Record<string, { label: string; path: string }> = {
      "/imoveis": { label: "Novo Imóvel", path: "/imoveis/novo" },
      "/proprietarios": { label: "Novo Proprietário", path: "/proprietarios/novo" },
      "/inquilinos": { label: "Novo Inquilino", path: "/inquilinos/novo" },
      "/contratos": { label: "Novo Contrato", path: "/contratos/novo" },
      "/documentos": { label: "Novo Documento", path: "/documentos/novo" },
    }

    const action = actions[pathname]
    if (!action) return null

    return (
      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          className="bg-black hover:bg-black/90"
          onClick={() => router.push(action.path)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      </div>
    )
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-black/10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {isSubRoute ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(basePath)}
              className="hover:bg-black/5 h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={basePath} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {currentPage.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">
                    {subRouteNames[subRouteName] || subRouteName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-base font-semibold">{currentPage.title}</h1>
          </div>
        )}

        {getActionButton()}
      </div>
    </header>
  )
}
