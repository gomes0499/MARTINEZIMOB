"use client"

import { useState, useMemo } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterBar } from "@/components/filter-bar"
import { PagamentoModal } from "@/components/pagamentos/pagamento-modal"
import { PagamentoDetailsSheet } from "@/components/pagamentos/pagamento-details-sheet"
import { Check, DollarSign, TrendingUp, AlertCircle, Clock, ChevronLeft, ChevronRight, MoreHorizontal, Eye } from "lucide-react"
import { registrarPagamento } from "@/lib/actions/pagamentos"
import { useToast } from "@/hooks/use-toast"

interface PagamentosTableProps {
  initialPagamentos: any[]
}

export function PagamentosTable({ initialPagamentos }: PagamentosTableProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [periodoFilter, setPeriodoFilter] = useState("mes-atual")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [pagamentos, setPagamentos] = useState(initialPagamentos)
  const { toast } = useToast()

  const handleView = (pagamento: any) => {
    setViewingItem(pagamento)
    setShowSheet(true)
  }

  const handleRegistrarPagamento = (pagamento: any) => {
    setSelectedPagamento(pagamento)
    setShowModal(true)
  }

  const handleSavePagamento = async (data: any) => {
    try {
      const result = await registrarPagamento(data.id, {
        data_pagamento: data.data_pagamento,
        valor_pago: Number.parseFloat(data.valor_pago),
        forma_pagamento: data.forma_pagamento,
        observacoes: data.observacoes,
      })

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Pagamento registrado com sucesso.",
        })
        setShowModal(false)
        setSelectedPagamento(null)
        window.location.reload()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao registrar pagamento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error registering pagamento:", error)
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento.",
        variant: "destructive",
      })
    }
  }

  const filteredPagamentos = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    return pagamentos.filter((p) => {
      // Filtros de busca, status e tipo
      const searchableText = `${p.imovel_nome || ""} ${p.imovel_endereco || ""} ${p.inquilino_nome || ""}`.toLowerCase()
      const matchesSearch = searchableText.includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "todos" || p.status === statusFilter
      const matchesTipo = tipoFilter === "todos" || p.tipo?.toLowerCase() === tipoFilter.toLowerCase()

      // Filtro de período
      let matchesPeriodo = true
      if (periodoFilter !== "todos") {
        const dataVencimento = new Date(p.data_vencimento)
        dataVencimento.setHours(0, 0, 0, 0)

        switch (periodoFilter) {
          case "mes-atual":
            matchesPeriodo =
              dataVencimento.getMonth() === hoje.getMonth() && dataVencimento.getFullYear() === hoje.getFullYear()
            break
          case "30-dias":
            const dias30Atras = new Date(hoje)
            dias30Atras.setDate(hoje.getDate() - 30)
            matchesPeriodo = dataVencimento >= dias30Atras && dataVencimento <= hoje
            break
          case "60-dias":
            const dias60Atras = new Date(hoje)
            dias60Atras.setDate(hoje.getDate() - 60)
            matchesPeriodo = dataVencimento >= dias60Atras && dataVencimento <= hoje
            break
          case "90-dias":
            const dias90Atras = new Date(hoje)
            dias90Atras.setDate(hoje.getDate() - 90)
            matchesPeriodo = dataVencimento >= dias90Atras && dataVencimento <= hoje
            break
          case "todos":
            matchesPeriodo = true
            break
        }
      }

      return matchesSearch && matchesStatus && matchesTipo && matchesPeriodo
    })
  }, [pagamentos, searchTerm, statusFilter, tipoFilter, periodoFilter])

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }
    > = {
      pago: { variant: "default", label: "Pago", className: "bg-green-600 hover:bg-green-600/90" },
      pendente: { variant: "secondary", label: "Pendente" },
      atrasado: { variant: "destructive", label: "Atrasado" },
      cancelado: { variant: "outline", label: "Cancelado" },
    }
    const config = variants[status] || variants.pendente
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  // Calcular stats baseados nos filtros aplicados
  const stats = useMemo(() => {
    const pagamentosPagos = filteredPagamentos.filter((p) => p.status === "pago")
    const pagamentosPendentes = filteredPagamentos.filter((p) => p.status === "pendente")
    const pagamentosAtrasados = filteredPagamentos.filter((p) => p.status === "atrasado")

    const recebido = pagamentosPagos.reduce((sum, p) => {
      const valor = Number(p.valor_pago || p.valor_total || p.valor_original || 0)
      return sum + (isNaN(valor) ? 0 : valor)
    }, 0)

    const pendente = pagamentosPendentes.reduce((sum, p) => {
      const valor = Number(p.valor_total || p.valor_original || 0)
      return sum + (isNaN(valor) ? 0 : valor)
    }, 0)

    const atrasado = pagamentosAtrasados.reduce((sum, p) => {
      const valor = Number(p.valor_total || p.valor_original || 0)
      return sum + (isNaN(valor) ? 0 : valor)
    }, 0)

    console.log("[Pagamentos Stats]", {
      total: filteredPagamentos.length,
      recebido,
      pendente,
      atrasado,
      pagamentosPagos: pagamentosPagos.length,
      pagamentosPendentes: pagamentosPendentes.length,
      pagamentosAtrasados: pagamentosAtrasados.length,
    })

    return {
      total: filteredPagamentos.length,
      recebido,
      pendente,
      atrasado,
    }
  }, [filteredPagamentos])

  // Paginação
  const totalPages = Math.ceil(filteredPagamentos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPagamentos = filteredPagamentos.slice(startIndex, endIndex)

  // Reset para primeira página quando filtros mudam
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, tipoFilter, periodoFilter])

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black/5 rounded-lg">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.recebido || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Recebido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.pendente || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.atrasado || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Atrasado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card com Filtros e Tabela */}
      <Card className="border-black/10 overflow-hidden">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por imóvel ou inquilino..."
          filters={[
            {
              value: periodoFilter,
              onValueChange: setPeriodoFilter,
              placeholder: "Período",
              options: [
                { value: "mes-atual", label: "Mês Atual" },
                { value: "30-dias", label: "Últimos 30 dias" },
                { value: "60-dias", label: "Últimos 60 dias" },
                { value: "90-dias", label: "Últimos 90 dias" },
                { value: "todos", label: "Todo o Período" },
              ],
            },
            {
              value: statusFilter,
              onValueChange: setStatusFilter,
              placeholder: "Status",
              options: [
                { value: "todos", label: "Todos os Status" },
                { value: "pago", label: "Pago" },
                { value: "pendente", label: "Pendente" },
                { value: "atrasado", label: "Atrasado" },
                { value: "cancelado", label: "Cancelado" },
              ],
            },
            {
              value: tipoFilter,
              onValueChange: setTipoFilter,
              placeholder: "Tipo",
              options: [
                { value: "todos", label: "Todos os Tipos" },
                { value: "aluguel", label: "Aluguel" },
                { value: "condomínio", label: "Condomínio" },
                { value: "iptu", label: "IPTU" },
                { value: "água", label: "Água" },
                { value: "luz", label: "Luz" },
                { value: "gás", label: "Gás" },
              ],
            },
          ]}
        />
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/10">
                <TableHead className="font-semibold">Imóvel</TableHead>
                <TableHead className="font-semibold">Inquilino</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Vencimento</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPagamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPagamentos.map((pagamento) => (
                  <TableRow
                    key={pagamento.id}
                    className="border-black/10 cursor-pointer hover:bg-black/5"
                    onClick={() => handleView(pagamento)}
                  >
                    <TableCell className="max-w-[300px]">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium truncate">{pagamento.imovel_nome || "Sem identificação"}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {pagamento.imovel_endereco}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="font-medium truncate">{pagamento.inquilino_nome || "Não informado"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-black/20">
                        {pagamento.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm font-medium">
                          {new Date(pagamento.data_vencimento).toLocaleDateString("pt-BR")}
                        </div>
                        {pagamento.status === "atrasado" && (
                          <div className="text-xs text-red-600">Atrasado</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="font-medium">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            pagamento.valor_total || pagamento.valor_original || 0,
                          )}
                        </div>
                        {(pagamento.valor_multa || pagamento.multa || 0) + (pagamento.valor_juros || pagamento.juros || 0) > 0 && (
                          <div className="text-xs text-red-600">
                            +{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                              (pagamento.valor_multa || pagamento.multa || 0) + (pagamento.valor_juros || pagamento.juros || 0),
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:bg-black/5"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleView(pagamento)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          {pagamento.status !== "pago" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRegistrarPagamento(pagamento)
                                }}
                                className="text-green-600 focus:text-green-600"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Registrar pagamento
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="border-t border-black/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPagamentos.length)} de{" "}
                {filteredPagamentos.length} pagamentos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-black/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Mostrar primeira, última e páginas próximas à atual
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-black hover:bg-black/90"
                              : "border-black/10"
                          }
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border-black/10"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {showModal && selectedPagamento && (
        <PagamentoModal
          onClose={() => {
            setShowModal(false)
            setSelectedPagamento(null)
          }}
          onSave={handleSavePagamento}
          pagamento={selectedPagamento}
        />
      )}

      <PagamentoDetailsSheet
        pagamento={viewingItem}
        open={showSheet}
        onOpenChange={setShowSheet}
      />
    </>
  )
}
