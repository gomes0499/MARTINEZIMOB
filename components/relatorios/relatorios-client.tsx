"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, TrendingUp, DollarSign, Users, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RelatoriosClientProps {
  relatorioFinanceiro: any
  relatorioProprietario: any
  relatorioImoveis: any
  relatorioInadimplencia: any
}

export function RelatoriosClient({
  relatorioFinanceiro,
  relatorioProprietario,
  relatorioImoveis,
  relatorioInadimplencia,
}: RelatoriosClientProps) {
  const [tipoRelatorio, setTipoRelatorio] = useState("financeiro")

  const relatorios = [
    {
      id: "financeiro",
      titulo: "Relatório Financeiro",
      descricao: "Receitas, despesas e inadimplência",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      id: "proprietario",
      titulo: "Relatório por Proprietário",
      descricao: "Repasses e imóveis por proprietário",
      icon: Users,
      color: "text-blue-600",
    },
    {
      id: "imoveis",
      titulo: "Relatório de Imóveis",
      descricao: "Ocupação e rentabilidade",
      icon: Building2,
      color: "text-purple-600",
    },
    {
      id: "inadimplencia",
      titulo: "Relatório de Inadimplência",
      descricao: "Pagamentos atrasados e pendentes",
      icon: TrendingUp,
      color: "text-red-600",
    },
  ]

  const handleExportar = (formato: string) => {
    alert(`Exportando relatório em ${formato.toUpperCase()}... (Funcionalidade em desenvolvimento)`)
  }

  return (
    <div className="space-y-6">
      {/* Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatorios.map((relatorio) => {
          const Icon = relatorio.icon
          return (
            <Card
              key={relatorio.id}
              className={`cursor-pointer transition-all ${
                tipoRelatorio === relatorio.id ? "ring-2 ring-primary" : "hover:shadow-md"
              }`}
              onClick={() => setTipoRelatorio(relatorio.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon className={`w-8 h-8 ${relatorio.color}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold">{relatorio.titulo}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{relatorio.descricao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botões de Exportação */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => handleExportar("pdf")}>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
        <Button variant="outline" onClick={() => handleExportar("excel")}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Relatório Financeiro */}
      {tipoRelatorio === "financeiro" && relatorioFinanceiro.success && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório Financeiro</CardTitle>
            <CardDescription>Resumo das movimentações financeiras do período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Receitas */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Receitas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        relatorioFinanceiro.data.receitaTotal,
                      )}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Recebido</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        relatorioFinanceiro.data.recebido,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {relatorioFinanceiro.data.receitaTotal > 0
                        ? ((relatorioFinanceiro.data.recebido / relatorioFinanceiro.data.receitaTotal) * 100).toFixed(0)
                        : 0}
                      % do total
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Pendente</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        relatorioFinanceiro.data.pendente,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {relatorioFinanceiro.data.receitaTotal > 0
                        ? ((relatorioFinanceiro.data.pendente / relatorioFinanceiro.data.receitaTotal) * 100).toFixed(0)
                        : 0}
                      % do total
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribuição */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Distribuição</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxas de Administração</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        relatorioFinanceiro.data.taxasAdministracao,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">10% da receita total</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Repasse aos Proprietários</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        relatorioFinanceiro.data.repasseProprietarios,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">90% da receita total</p>
                  </div>
                </div>
              </div>

              {/* Inadimplência */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Inadimplência</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pagamentos Atrasados</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                          relatorioFinanceiro.data.atrasado,
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium">Taxa de Inadimplência</p>
                      <p
                        className={`text-3xl font-bold ${relatorioFinanceiro.data.taxaInadimplencia > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {relatorioFinanceiro.data.taxaInadimplencia.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório por Proprietário */}
      {tipoRelatorio === "proprietario" && relatorioProprietario.success && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório por Proprietário</CardTitle>
            <CardDescription>Repasses e imóveis por proprietário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatorioProprietario.data.map((prop: any) => (
                <div key={prop.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{prop.nome}</h4>
                      <p className="text-sm text-muted-foreground">{prop.cpfCnpj}</p>
                      <div className="flex gap-4 mt-2">
                        <Badge variant="outline">
                          {prop.totalImoveis} {prop.totalImoveis === 1 ? "imóvel" : "imóveis"}
                        </Badge>
                        <Badge variant="outline">
                          {prop.imoveisLocados} {prop.imoveisLocados === 1 ? "locado" : "locados"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total de Repasses</p>
                      <p className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                          prop.totalRepasses,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Imóveis */}
      {tipoRelatorio === "imoveis" && relatorioImoveis.success && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Imóveis</CardTitle>
            <CardDescription>Ocupação e rentabilidade dos imóveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Estatísticas Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Imóveis</p>
                  <p className="text-2xl font-bold">{relatorioImoveis.data.totais.total}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Locados</p>
                  <p className="text-2xl font-bold text-green-600">{relatorioImoveis.data.totais.locados}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                  <p className="text-2xl font-bold text-blue-600">{relatorioImoveis.data.totais.disponiveis}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold">{relatorioImoveis.data.totais.taxaOcupacao.toFixed(1)}%</p>
                </div>
              </div>

              {/* Lista de Imóveis */}
              <div className="space-y-4">
                {relatorioImoveis.data.imoveis.map((imovel: any) => (
                  <div key={imovel.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{imovel.enderecoCompleto}</h4>
                        <p className="text-sm text-muted-foreground">{imovel.proprietario}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge
                            variant={
                              imovel.status === "locado"
                                ? "default"
                                : imovel.status === "disponivel"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {imovel.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Aluguel:{" "}
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                              imovel.valorAluguel,
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Receita no Período</p>
                        <p className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            imovel.receitaPeriodo,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Inadimplência */}
      {tipoRelatorio === "inadimplencia" && relatorioInadimplencia.success && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Inadimplência</CardTitle>
            <CardDescription>Pagamentos atrasados e pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Totais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Pagamentos Atrasados</p>
                  <p className="text-2xl font-bold text-red-600">{relatorioInadimplencia.data.totais.totalAtrasados}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor Total Atrasado</p>
                  <p className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      relatorioInadimplencia.data.totais.valorTotalAtrasado,
                    )}
                  </p>
                </div>
              </div>

              {/* Lista de Pagamentos Atrasados */}
              <div className="space-y-4">
                {relatorioInadimplencia.data.pagamentos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum pagamento atrasado no período</p>
                  </div>
                ) : (
                  relatorioInadimplencia.data.pagamentos.map((pag: any) => (
                    <div key={pag.id} className="p-4 border rounded-lg border-red-200 bg-red-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{pag.imovel}</h4>
                          <p className="text-sm text-muted-foreground">{pag.inquilino}</p>
                          <p className="text-sm text-muted-foreground">{pag.telefone}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{pag.tipo}</Badge>
                            <Badge variant="destructive">{pag.diasAtraso} dias de atraso</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Valor</p>
                          <p className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                              pag.valorTotal,
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vencimento: {new Date(pag.dataVencimento).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
