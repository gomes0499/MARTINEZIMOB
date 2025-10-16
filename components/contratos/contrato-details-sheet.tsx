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
import { FileText, Home, Users, DollarSign, Calendar, Shield, Percent, ClipboardList } from "lucide-react"

type Contrato = {
  id: string | number
  imovel_id: string | number
  imovel_endereco?: string
  imovel_nome?: string
  inquilino_principal_id?: string | number
  inquilino_nome?: string
  inquilino_cpf_cnpj?: string
  proprietario_nome?: string
  data_inicio: string | Date
  data_fim: string | Date
  valor_aluguel: number
  dia_vencimento: number
  tipo_reajuste: string
  indice_reajuste?: string
  periodicidade_reajuste?: number
  tipo_garantia: string
  valor_garantia?: number
  taxa_administracao: number
  observacoes?: string
  status: string
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

type ContratoDetailsSheetProps = {
  contrato: Contrato | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContratoDetailsSheet({
  contrato,
  open,
  onOpenChange,
}: ContratoDetailsSheetProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && contrato) {
      setLoading(true)
      getDocumentosByEntidade("contrato", String(contrato.id)).then((result) => {
        if (result.success && result.data) {
          setDocumentos(result.data as Documento[])
        }
        setLoading(false)
      })
    }
  }, [open, contrato])

  if (!contrato) return null

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; className?: string }> = {
    ativo: { label: "Ativo", variant: "default", className: "bg-green-600 hover:bg-green-600/90" },
    encerrado: { label: "Encerrado", variant: "secondary" },
    cancelado: { label: "Cancelado", variant: "destructive" },
  }

  const statusInfo = statusMap[contrato.status] || statusMap.ativo

  const formatCpfCnpj = (cpfCnpj: string) => {
    const cleaned = cpfCnpj.replace(/\D/g, "")
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return cpfCnpj
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 border-b border-black/10">
          <SheetHeader>
            <SheetTitle className="text-2xl">
              Contrato #{contrato.id}
            </SheetTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge
                variant={statusInfo.variant}
                className={statusInfo.className}
              >
                {statusInfo.label}
              </Badge>
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
                <p className="font-medium">{contrato.imovel_endereco || "Não informado"}</p>
              </div>
              {contrato.proprietario_nome && (
                <div>
                  <p className="text-sm text-muted-foreground">Proprietário</p>
                  <p className="font-medium">{contrato.proprietario_nome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inquilino */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Inquilino Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{contrato.inquilino_nome || "Não informado"}</p>
              </div>
              {contrato.inquilino_cpf_cnpj && (
                <div>
                  <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                  <p className="font-medium font-mono">{formatCpfCnpj(contrato.inquilino_cpf_cnpj)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Período do Contrato */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Período do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium">{formatDate(contrato.data_inicio)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Término</p>
                  <p className="font-medium">{formatDate(contrato.data_fim)}</p>
                </div>
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
                <p className="text-sm text-muted-foreground">Valor do Aluguel</p>
                <p className="font-medium text-lg">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(contrato.valor_aluguel)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dia de Vencimento</p>
                <p className="font-medium">Dia {contrato.dia_vencimento} de cada mês</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Administração</p>
                <p className="font-medium">{contrato.taxa_administracao}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Reajuste */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Percent className="h-5 w-5" />
                Reajuste
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Reajuste</p>
                <p className="font-medium capitalize">{contrato.tipo_reajuste}</p>
              </div>
              {contrato.indice_reajuste && (
                <div>
                  <p className="text-sm text-muted-foreground">Índice de Reajuste</p>
                  <p className="font-medium">{contrato.indice_reajuste}</p>
                </div>
              )}
              {contrato.periodicidade_reajuste && (
                <div>
                  <p className="text-sm text-muted-foreground">Periodicidade</p>
                  <p className="font-medium">{contrato.periodicidade_reajuste} meses</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Garantia */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Garantia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Garantia</p>
                <p className="font-medium capitalize">{contrato.tipo_garantia}</p>
              </div>
              {contrato.valor_garantia && (
                <div>
                  <p className="text-sm text-muted-foreground">Valor da Garantia</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(contrato.valor_garantia)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {contrato.observacoes && (
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm whitespace-pre-wrap">{contrato.observacoes}</p>
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
