"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Building2, FileText, Calendar, User, Briefcase } from "lucide-react"
import { Inquilino } from "@/lib/actions/inquilinos"
import { getDocumentosByEntidade } from "@/lib/actions/documentos"

// Função para formatar CPF: 000.000.000-00
function formatCPF(cpf: string) {
  const numbers = cpf.replace(/\D/g, '')
  if (numbers.length !== 11) return cpf
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Função para formatar CNPJ: 00.000.000/0000-00
function formatCNPJ(cnpj: string) {
  const numbers = cnpj.replace(/\D/g, '')
  if (numbers.length !== 14) return cnpj
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Função para formatar CPF ou CNPJ
function formatCPFCNPJ(value: string) {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length === 11) return formatCPF(value)
  if (numbers.length === 14) return formatCNPJ(value)
  return value
}

// Função para formatar telefone: (00) 00000-0000 ou (00) 0000-0000
function formatPhone(phone: string) {
  if (!phone) return ''
  const numbers = phone.replace(/\D/g, '')
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// Função para formatar dinheiro
function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface InquilinoDetailsSheetProps {
  inquilino: Inquilino | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquilinoDetailsSheet({
  inquilino,
  open,
  onOpenChange,
}: InquilinoDetailsSheetProps) {
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    if (open && inquilino) {
      setLoadingDocs(true)
      getDocumentosByEntidade("inquilino", inquilino.id)
        .then((result) => {
          if (result.success && result.data) {
            setDocumentos(result.data)
          }
        })
        .finally(() => setLoadingDocs(false))
    }
  }, [open, inquilino])

  if (!inquilino) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 border-b border-black/10">
          <SheetHeader>
            <SheetTitle className="text-2xl">{inquilino.nome}</SheetTitle>
            <SheetDescription className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="border-black/20">
                {inquilino.tipo_pessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
              </Badge>
              <Badge
                variant={inquilino.ativo ? "default" : "secondary"}
                className={inquilino.ativo ? "bg-black hover:bg-black/90" : ""}
              >
                {inquilino.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações de Contato */}
          <Card className="border-black/10">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">CPF/CNPJ</label>
                  <p className="font-medium">{formatCPFCNPJ(inquilino.cpf_cnpj)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{inquilino.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Telefone</label>
                  <p className="font-medium">{inquilino.telefone ? formatPhone(inquilino.telefone) : "Não informado"}</p>
                </div>
                {inquilino.celular && (
                  <div>
                    <label className="text-sm text-muted-foreground">Celular</label>
                    <p className="font-medium">{formatPhone(inquilino.celular)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais (apenas PF) */}
          {inquilino.tipo_pessoa === "fisica" && (
            <Card className="border-black/10">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inquilino.data_nascimento && (
                    <div>
                      <label className="text-sm text-muted-foreground">Data de Nascimento</label>
                      <p className="font-medium">
                        {typeof inquilino.data_nascimento === 'string' || inquilino.data_nascimento instanceof Date
                          ? new Date(inquilino.data_nascimento).toLocaleDateString("pt-BR")
                          : String(inquilino.data_nascimento)}
                      </p>
                    </div>
                  )}
                  {inquilino.estado_civil && (
                    <div>
                      <label className="text-sm text-muted-foreground">Estado Civil</label>
                      <p className="font-medium">{inquilino.estado_civil}</p>
                    </div>
                  )}
                  {inquilino.profissao && (
                    <div>
                      <label className="text-sm text-muted-foreground">Profissão</label>
                      <p className="font-medium">{inquilino.profissao}</p>
                    </div>
                  )}
                  {inquilino.renda_mensal && (
                    <div>
                      <label className="text-sm text-muted-foreground">Renda Mensal</label>
                      <p className="font-medium">{formatCurrency(inquilino.renda_mensal)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Endereço */}
          {inquilino.endereco_logradouro && (
            <Card className="border-black/10">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Logradouro</label>
                    <p className="font-medium">
                      {inquilino.endereco_logradouro}, {inquilino.endereco_numero}
                      {inquilino.endereco_complemento && ` - ${inquilino.endereco_complemento}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Bairro</label>
                    <p className="font-medium">{inquilino.endereco_bairro || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Cidade/UF</label>
                    <p className="font-medium">
                      {inquilino.endereco_cidade || "-"}/{inquilino.endereco_estado || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">CEP</label>
                    <p className="font-medium">{inquilino.endereco_cep || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentos */}
          <Card className="border-black/10">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos ({documentos.length})
              </h3>
              {loadingDocs ? (
                <p className="text-sm text-muted-foreground">Carregando documentos...</p>
              ) : documentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum documento cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-black/10 rounded-lg hover:bg-black/5"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.tipo_documento}</p>
                          <p className="text-xs text-muted-foreground">{doc.nome_arquivo}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url_arquivo} target="_blank" rel="noopener noreferrer">
                          Ver
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {inquilino.observacoes && (
            <Card className="border-black/10">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Observações</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {inquilino.observacoes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Data de Cadastro */}
          {inquilino.created_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Cadastrado em {new Date(inquilino.created_at).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
