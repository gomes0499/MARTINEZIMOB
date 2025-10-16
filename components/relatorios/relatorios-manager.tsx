"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  DollarSign,
  TrendingUp,
  Home,
  Users,
  Calendar,
  Download,
  Eye,
  FileBarChart,
  PieChart,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react"
import { RelatorioFilters } from "./relatorio-filters"

interface TipoRelatorio {
  id: string
  titulo: string
  descricao: string
  icone: any
  cor: string
  categoria: "financeiro" | "operacional" | "gerencial"
  disponivel: boolean
}

const tiposRelatorios: TipoRelatorio[] = [
  // FINANCEIROS
  {
    id: "fluxo-caixa",
    titulo: "Fluxo de Caixa",
    descricao: "Receitas, despesas e saldo por período",
    icone: TrendingUp,
    cor: "green",
    categoria: "financeiro",
    disponivel: false,
  },
  {
    id: "inadimplencia",
    titulo: "Inadimplência",
    descricao: "Pagamentos atrasados e pendentes",
    icone: FileBarChart,
    cor: "red",
    categoria: "financeiro",
    disponivel: false,
  },
  {
    id: "repasses",
    titulo: "Repasses a Proprietários",
    descricao: "Repasses realizados e pendentes",
    icone: DollarSign,
    cor: "blue",
    categoria: "financeiro",
    disponivel: false,
  },
  {
    id: "rentabilidade",
    titulo: "Rentabilidade por Imóvel",
    descricao: "Análise de retorno por propriedade",
    icone: PieChart,
    cor: "purple",
    categoria: "financeiro",
    disponivel: false,
  },

  // OPERACIONAIS
  {
    id: "contratos-ativos",
    titulo: "Contratos Ativos",
    descricao: "Lista completa de contratos vigentes",
    icone: FileText,
    cor: "orange",
    categoria: "operacional",
    disponivel: false,
  },
  {
    id: "contratos-vencimento",
    titulo: "Contratos a Vencer",
    descricao: "Contratos com vencimento próximo",
    icone: Calendar,
    cor: "yellow",
    categoria: "operacional",
    disponivel: false,
  },
  {
    id: "ocupacao",
    titulo: "Taxa de Ocupação",
    descricao: "Imóveis ocupados vs disponíveis",
    icone: Home,
    cor: "cyan",
    categoria: "operacional",
    disponivel: false,
  },
  {
    id: "manutencoes",
    titulo: "Manutenções",
    descricao: "Histórico de manutenções por imóvel",
    icone: FileSpreadsheet,
    cor: "gray",
    categoria: "operacional",
    disponivel: false,
  },

  // GERENCIAIS
  {
    id: "proprietarios",
    titulo: "Relatório de Proprietários",
    descricao: "Dados completos de proprietários e suas propriedades",
    icone: Users,
    cor: "indigo",
    categoria: "gerencial",
    disponivel: false,
  },
  {
    id: "inquilinos",
    titulo: "Relatório de Inquilinos",
    descricao: "Informações detalhadas dos inquilinos",
    icone: Users,
    cor: "pink",
    categoria: "gerencial",
    disponivel: false,
  },
  {
    id: "imoveis",
    titulo: "Portfólio de Imóveis",
    descricao: "Inventário completo de propriedades",
    icone: Home,
    cor: "teal",
    categoria: "gerencial",
    disponivel: false,
  },
  {
    id: "comissoes",
    titulo: "Comissões e Taxas",
    descricao: "Análise de taxas de administração cobradas",
    icone: BarChart3,
    cor: "emerald",
    categoria: "gerencial",
    disponivel: false,
  },
]

export function RelatoriosManager() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todos")
  const [periodoInicio, setPeriodoInicio] = useState("")
  const [periodoFim, setPeriodoFim] = useState("")

  const relatoriosFiltrados = tiposRelatorios.filter((rel) => {
    if (categoriaAtiva === "todos") return true
    return rel.categoria === categoriaAtiva
  })

  const getCorClasse = (cor: string, tipo: "bg" | "text" | "border") => {
    const cores: Record<string, Record<string, string>> = {
      green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
      red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
      blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
      yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
      cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
      gray: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
      indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
      pink: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
      teal: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    }
    return cores[cor]?.[tipo] || cores.gray[tipo]
  }

  const handleGerarRelatorio = (relatorioId: string) => {
    console.log("Gerar relatório:", relatorioId, { periodoInicio, periodoFim })
    // TODO: Implementar geração de relatório
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <RelatorioFilters
        periodoInicio={periodoInicio}
        periodoFim={periodoFim}
        onPeriodoInicioChange={setPeriodoInicio}
        onPeriodoFimChange={setPeriodoFim}
      />

      {/* Filtros de Categoria */}
      <div className="flex gap-2">
        <Button
          variant={categoriaAtiva === "todos" ? "default" : "outline"}
          onClick={() => setCategoriaAtiva("todos")}
          className={categoriaAtiva === "todos" ? "bg-black hover:bg-black/90" : "border-black/10"}
        >
          Todos ({tiposRelatorios.length})
        </Button>
        <Button
          variant={categoriaAtiva === "financeiro" ? "default" : "outline"}
          onClick={() => setCategoriaAtiva("financeiro")}
          className={categoriaAtiva === "financeiro" ? "bg-black hover:bg-black/90" : "border-black/10"}
        >
          Financeiros ({tiposRelatorios.filter((r) => r.categoria === "financeiro").length})
        </Button>
        <Button
          variant={categoriaAtiva === "operacional" ? "default" : "outline"}
          onClick={() => setCategoriaAtiva("operacional")}
          className={categoriaAtiva === "operacional" ? "bg-black hover:bg-black/90" : "border-black/10"}
        >
          Operacionais ({tiposRelatorios.filter((r) => r.categoria === "operacional").length})
        </Button>
        <Button
          variant={categoriaAtiva === "gerencial" ? "default" : "outline"}
          onClick={() => setCategoriaAtiva("gerencial")}
          className={categoriaAtiva === "gerencial" ? "bg-black hover:bg-black/90" : "border-black/10"}
        >
          Gerenciais ({tiposRelatorios.filter((r) => r.categoria === "gerencial").length})
        </Button>
      </div>

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatoriosFiltrados.map((relatorio) => {
          const Icone = relatorio.icone

          return (
            <Card
              key={relatorio.id}
              className={`border-black/10 ${!relatorio.disponivel ? "opacity-60" : "hover:shadow-lg transition-shadow"}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${getCorClasse(relatorio.cor, "bg")}`}>
                    <Icone className={`w-6 h-6 ${getCorClasse(relatorio.cor, "text")}`} />
                  </div>
                  {!relatorio.disponivel && (
                    <Badge variant="outline" className="border-black/20">
                      Em breve
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-4">{relatorio.titulo}</CardTitle>
                <CardDescription>{relatorio.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-black/10"
                    disabled={!relatorio.disponivel}
                    onClick={() => handleGerarRelatorio(relatorio.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-black/10"
                    disabled={!relatorio.disponivel}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
                {relatorio.disponivel && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    <p className="text-xs text-muted-foreground">
                      Formatos: PDF, Excel, CSV
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {relatoriosFiltrados.length === 0 && (
        <Card className="border-black/10">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Não há relatórios disponíveis para esta categoria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
