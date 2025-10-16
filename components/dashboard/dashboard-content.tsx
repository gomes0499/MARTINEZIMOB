"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  Calendar,
  UserCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReceitaChart } from "./receita-chart"
import { ReceitaTotalChart } from "./receita-total-chart"
import { DashboardFilters } from "./dashboard-filters"
import { getDashboardDataByPeriod } from "@/lib/actions/dashboard"

interface DashboardContentProps {
  stats: any
  pagamentosPendentes: any[]
  contratosRecentes: any[]
  receitaMensal: Array<{ mes: string; valor: number }>
  receitaTotal: Array<{ mes: string; valor: number }>
}

export function DashboardContent({
  stats: initialStats,
  pagamentosPendentes: initialPagamentos,
  contratosRecentes: initialContratos,
  receitaMensal: initialReceitaMensal,
  receitaTotal: initialReceitaTotal,
}: DashboardContentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("mes-atual")
  const [isPending, startTransition] = useTransition()

  const [financeiro, setFinanceiro] = useState(initialStats.financeiro)
  const [pagamentosPendentes, setPagamentosPendentes] = useState(initialPagamentos)
  const [contratosRecentes, setContratosRecentes] = useState(initialContratos)
  const [receitaMensal, setReceitaMensal] = useState(initialReceitaMensal)
  const [receitaTotal, setReceitaTotal] = useState(initialReceitaTotal)

  const handlePeriodChange = (period: string) => {
    console.log("[Dashboard Client] Period changed to:", period)
    setSelectedPeriod(period)

    startTransition(async () => {
      console.log("[Dashboard Client] Calling getDashboardDataByPeriod")
      const result = await getDashboardDataByPeriod(period as any)
      console.log("[Dashboard Client] Result:", result)

      if (result.success && 'data' in result && result.data) {
        console.log("[Dashboard Client] Updating state with:", result.data.financeiro)
        setFinanceiro(result.data.financeiro)
        setPagamentosPendentes(result.data.pagamentosPendentes)
        setContratosRecentes(result.data.contratosRecentes)
        setReceitaMensal(result.data.receitaMensal)
        setReceitaTotal(result.data.receitaTotal)
      }
    })
  }

  const stats = {
    ...initialStats,
    financeiro,
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
      {/* Filtros */}
      <DashboardFilters selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Imóveis
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.imoveis.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.imoveis.disponiveis} disponíveis • {stats.imoveis.locados} locados
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contratos Ativos
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contratos.ativos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.contratos.vencendo} vencendo este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita da Imobiliária
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.financeiro.receitaMensal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              10% dos aluguéis • {stats.financeiro.crescimento > 0 ? "+" : ""}
              {stats.financeiro.crescimento}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.financeiro.receitaTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">100% dos aluguéis</p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cadastros
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cadastros.proprietarios + stats.cadastros.inquilinos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.cadastros.proprietarios} proprietários •{" "}
              {stats.cadastros.inquilinos} inquilinos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              Recebido Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.financeiro.recebido)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.financeiro.receitaMensal > 0
                ? ((stats.financeiro.recebido / stats.financeiro.receitaMensal) * 100).toFixed(0)
                : 0}
              % da receita mensal
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600" />
              Pendente Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.financeiro.pendente)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.financeiro.receitaMensal > 0
                ? ((stats.financeiro.pendente / stats.financeiro.receitaMensal) * 100).toFixed(0)
                : 0}
              % da receita mensal
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              Atrasado Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.financeiro.atrasado)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.financeiro.atrasado > 0 && stats.financeiro.receitaMensal > 0
                ? `${((stats.financeiro.atrasado / stats.financeiro.receitaMensal) * 100).toFixed(0)}% da receita mensal`
                : "Nenhum atraso"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Receita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ReceitaChart data={receitaMensal} />
        <ReceitaTotalChart data={receitaTotal} />
      </div>

      {/* Avisos e pendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pagamentos Pendentes
            </CardTitle>
            <Link href="/pagamentos">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pagamentosPendentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum pagamento pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pagamentosPendentes.slice(0, 5).map((pagamento) => (
                  <div
                    key={pagamento.id}
                    className="flex items-center justify-between py-3 border-b border-black/5 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{pagamento.contrato}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {pagamento.inquilino}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(pagamento.valor)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(pagamento.vencimento).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Contratos Recentes
            </CardTitle>
            <Link href="/contratos">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {contratosRecentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum contrato cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contratosRecentes.slice(0, 5).map((contrato) => (
                  <div
                    key={contrato.id}
                    className="flex items-center justify-between py-3 border-b border-black/5 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{contrato.imovel}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {contrato.inquilino}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(contrato.valor)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(contrato.dataInicio).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
