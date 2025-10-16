"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDocumentosByEntidade } from "@/lib/actions/documentos"
import { FileText, Home, Users, DollarSign, Calendar, CreditCard, ClipboardList, AlertTriangle } from "lucide-react"

type Pagamento = {
  id: string | number
  contrato_id: string | number
  tipo: string
  mes_referencia?: string
  data_vencimento: string | Date
  valor_original: number
  valor_pago?: number
  data_pagamento?: string | Date
  dias_atraso?: number
  valor_multa?: number
  valor_juros?: number
  valor_desconto?: number
  valor_total?: number
  forma_pagamento?: string
  status: string
  observacoes?: string
  imovel_endereco?: string
  imovel_nome?: string
  inquilino_nome?: string
  proprietario_nome?: string
  created_at?: string | Date
  updated_at?: string | Date
}

type Documento = {
  id: string
  nome: string
  arquivo_url: string
  tipo_documento: string
  created_at: Date
}

type PagamentoDetailsSheetProps = {
  pagamento: Pagamento | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PagamentoDetailsSheet({
  pagamento,
  open,
  onOpenChange,
}: PagamentoDetailsSheetProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && pagamento) {
      setLoading(true)
      getDocumentosByEntidade("pagamento", String(pagamento.id)).then((result) => {
        if (result.success && result.data) {
          setDocumentos(result.data as Documento[])
        }
        setLoading(false)
      })
    }
  }, [open, pagamento])

  if (!pagamento) return null

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
    pago: { label: "Pago", variant: "default", className: "bg-green-600 hover:bg-green-600/90" },
    pendente: { label: "Pendente", variant: "secondary" },
    atrasado: { label: "Atrasado", variant: "destructive" },
    cancelado: { label: "Cancelado", variant: "outline" },
  }

  const statusInfo = statusMap[pagamento.status] || statusMap.pendente

  const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return "Não informado"
    try {
      return new Date(date).toLocaleDateString("pt-BR")
    } catch {
      return String(date)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 border-b border-black/10">
          <SheetHeader>
            <SheetTitle className="text-2xl">
              Pagamento #{pagamento.id}
            </SheetTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="border-black/20">
                {pagamento.tipo}
              </Badge>
              <Badge
                variant={statusInfo.variant}
                className={statusInfo.className}
              >
                {statusInfo.label}
              </Badge>
              {pagamento.dias_atraso && pagamento.dias_atraso > 0 && (
                <Badge variant="destructive">
                  {pagamento.dias_atraso} dia(s) de atraso
                </Badge>
              )}
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Imóvel */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5" />
                Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{pagamento.imovel_endereco || "Não informado"}</p>
              </div>
              {pagamento.proprietario_nome && (
                <div>
                  <p className="text-sm text-muted-foreground">Proprietário</p>
                  <p className="font-medium">{pagamento.proprietario_nome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inquilino */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Inquilino
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="font-medium">{pagamento.inquilino_nome || "Não informado"}</p>
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              {pagamento.mes_referencia && (
                <div>
                  <p className="text-sm text-muted-foreground">Mês de Referência</p>
                  <p className="font-medium">
                    {typeof pagamento.mes_referencia === 'object' && pagamento.mes_referencia !== null && 'getTime' in pagamento.mes_referencia
                      ? formatDate(pagamento.mes_referencia as Date)
                      : String(pagamento.mes_referencia)}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                  <p className="font-medium">{formatDate(pagamento.data_vencimento)}</p>
                </div>
                {pagamento.data_pagamento && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                    <p className="font-medium text-green-600">{formatDate(pagamento.data_pagamento)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Valores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Valor Original</p>
                <p className="font-medium text-lg">{formatCurrency(pagamento.valor_original)}</p>
              </div>

              {(pagamento.valor_multa || pagamento.valor_juros || pagamento.valor_desconto) && (
                <div className="grid grid-cols-3 gap-3">
                  {pagamento.valor_multa && pagamento.valor_multa > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Multa</p>
                      <p className="font-medium text-red-600">+{formatCurrency(pagamento.valor_multa)}</p>
                    </div>
                  )}
                  {pagamento.valor_juros && pagamento.valor_juros > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Juros</p>
                      <p className="font-medium text-red-600">+{formatCurrency(pagamento.valor_juros)}</p>
                    </div>
                  )}
                  {pagamento.valor_desconto && pagamento.valor_desconto > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Desconto</p>
                      <p className="font-medium text-green-600">-{formatCurrency(pagamento.valor_desconto)}</p>
                    </div>
                  )}
                </div>
              )}

              {pagamento.valor_total && (
                <div className="pt-3 border-t border-black/10">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-bold text-xl">{formatCurrency(pagamento.valor_total)}</p>
                </div>
              )}

              {pagamento.valor_pago && (
                <div>
                  <p className="text-sm text-muted-foreground">Valor Pago</p>
                  <p className="font-bold text-xl text-green-600">{formatCurrency(pagamento.valor_pago)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forma de Pagamento */}
          {pagamento.forma_pagamento && (
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="font-medium capitalize">{pagamento.forma_pagamento}</p>
              </CardContent>
            </Card>
          )}

          {/* Atraso */}
          {pagamento.status === "atrasado" && pagamento.dias_atraso && pagamento.dias_atraso > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Aviso de Atraso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-red-600 font-medium">
                  Este pagamento está atrasado há {pagamento.dias_atraso} dia(s).
                </p>
                {(pagamento.valor_multa || pagamento.valor_juros) && (
                  <p className="text-sm text-red-600 mt-2">
                    Multa e juros foram aplicados ao valor total.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {pagamento.observacoes && (
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm whitespace-pre-wrap">{pagamento.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Documentos */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando documentos...</p>
              ) : documentos.length > 0 ? (
                <div className="space-y-2">
                  {documentos.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border border-black/10 hover:bg-black/5 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.nome}</p>
                        <p className="text-xs text-muted-foreground">{doc.tipo_documento}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum documento cadastrado</p>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
