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
import { FileText, MapPin, Home, DollarSign, FileIcon, ClipboardList } from "lucide-react"

type Imovel = {
  id: string
  proprietario_id: string
  proprietario_nome?: string
  tipo: string
  status: string
  endereco_cep: string
  endereco_logradouro: string
  endereco_numero: string
  endereco_complemento?: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_estado: string
  descricao?: string
  area_total?: number
  area_construida?: number
  quartos: number
  banheiros: number
  vagas_garagem: number
  valor_aluguel: number
  valor_condominio?: number
  iptu_anual?: number
  iptu_mensal?: number
  conta_luz?: string
  conta_agua?: string
  conta_gas?: string
  observacoes?: string
  created_at?: Date
  updated_at?: Date
}

type Documento = {
  id: string
  nome: string
  arquivo_url: string
  tipo_documento: string
  created_at: Date
}

type ImovelDetailsSheetProps = {
  imovel: Imovel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImovelDetailsSheet({
  imovel,
  open,
  onOpenChange,
}: ImovelDetailsSheetProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && imovel) {
      setLoading(true)
      getDocumentosByEntidade("imovel", imovel.id).then((result) => {
        if (result.success && result.data) {
          setDocumentos(result.data as Documento[])
        }
        setLoading(false)
      })
    }
  }, [open, imovel])

  if (!imovel) return null

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    disponivel: { label: "Disponível", variant: "secondary" },
    locado: { label: "Locado", variant: "default" },
    manutencao: { label: "Manutenção", variant: "destructive" },
    inativo: { label: "Inativo", variant: "secondary" },
  }

  const statusInfo = statusMap[imovel.status] || statusMap.disponivel

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 border-b border-black/10">
          <SheetHeader>
            <SheetTitle className="text-2xl">
              {imovel.endereco_logradouro}, {imovel.endereco_numero}
            </SheetTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="border-black/20">
                {imovel.tipo}
              </Badge>
              <Badge
                variant={statusInfo.variant}
                className={statusInfo.variant === "default" ? "bg-black hover:bg-black/90" : ""}
              >
                {statusInfo.label}
              </Badge>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Endereço */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Logradouro</p>
                  <p className="font-medium">{imovel.endereco_logradouro}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="font-medium">{imovel.endereco_numero}</p>
                </div>
              </div>
              {imovel.endereco_complemento && (
                <div>
                  <p className="text-sm text-muted-foreground">Complemento</p>
                  <p className="font-medium">{imovel.endereco_complemento}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Bairro</p>
                  <p className="font-medium">{imovel.endereco_bairro}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CEP</p>
                  <p className="font-medium">{imovel.endereco_cep}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Cidade</p>
                  <p className="font-medium">{imovel.endereco_cidade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{imovel.endereco_estado}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proprietário */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Proprietário
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="font-medium">{imovel.proprietario_nome || "Não informado"}</p>
            </CardContent>
          </Card>

          {/* Características */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5" />
                Características
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid gap-3">
              {imovel.descricao && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{imovel.descricao}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {imovel.area_total && (
                  <div>
                    <p className="text-sm text-muted-foreground">Área Total</p>
                    <p className="font-medium">{imovel.area_total} m²</p>
                  </div>
                )}
                {imovel.area_construida && (
                  <div>
                    <p className="text-sm text-muted-foreground">Área Construída</p>
                    <p className="font-medium">{imovel.area_construida} m²</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Quartos</p>
                  <p className="font-medium">{imovel.quartos}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banheiros</p>
                  <p className="font-medium">{imovel.banheiros}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Garagem</p>
                  <p className="font-medium">{imovel.vagas_garagem} vaga(s)</p>
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
                  }).format(imovel.valor_aluguel)}
                </p>
              </div>
              {imovel.valor_condominio && (
                <div>
                  <p className="text-sm text-muted-foreground">Condomínio</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(imovel.valor_condominio)}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {imovel.iptu_mensal && (
                  <div>
                    <p className="text-sm text-muted-foreground">IPTU Mensal</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(imovel.iptu_mensal)}
                    </p>
                  </div>
                )}
                {imovel.iptu_anual && (
                  <div>
                    <p className="text-sm text-muted-foreground">IPTU Anual</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(imovel.iptu_anual)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contas */}
          {(imovel.conta_luz || imovel.conta_agua || imovel.conta_gas) && (
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileIcon className="h-5 w-5" />
                  Contas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 grid gap-3">
                {imovel.conta_luz && (
                  <div>
                    <p className="text-sm text-muted-foreground">Conta de Luz</p>
                    <p className="font-medium">{imovel.conta_luz}</p>
                  </div>
                )}
                {imovel.conta_agua && (
                  <div>
                    <p className="text-sm text-muted-foreground">Conta de Água</p>
                    <p className="font-medium">{imovel.conta_agua}</p>
                  </div>
                )}
                {imovel.conta_gas && (
                  <div>
                    <p className="text-sm text-muted-foreground">Conta de Gás</p>
                    <p className="font-medium">{imovel.conta_gas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {imovel.observacoes && (
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm whitespace-pre-wrap">{imovel.observacoes}</p>
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
