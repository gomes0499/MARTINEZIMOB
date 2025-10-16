"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { X, Mail, Phone, MapPin, Building2, FileText, Calendar } from "lucide-react"
import { Proprietario } from "@/lib/actions/proprietarios"
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

interface ProprietarioDetailsDrawerProps {
  proprietario: Proprietario | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProprietarioDetailsDrawer({
  proprietario,
  open,
  onOpenChange,
}: ProprietarioDetailsDrawerProps) {
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    if (open && proprietario) {
      setLoadingDocs(true)
      getDocumentosByEntidade("proprietario", proprietario.id)
        .then((result) => {
          if (result.success && result.data) {
            setDocumentos(result.data)
          }
        })
        .finally(() => setLoadingDocs(false))
    }
  }, [open, proprietario])

  if (!proprietario) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 border-b border-black/10">
          <SheetHeader>
            <SheetTitle className="text-2xl">{proprietario.nome}</SheetTitle>
            <SheetDescription className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="border-black/20">
                {proprietario.tipo_pessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
              </Badge>
              <Badge
                variant={proprietario.ativo ? "default" : "secondary"}
                className={proprietario.ativo ? "bg-black hover:bg-black/90" : ""}
              >
                {proprietario.ativo ? "Ativo" : "Inativo"}
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
                    <p className="font-medium">{formatCPFCNPJ(proprietario.cpf_cnpj)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{proprietario.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Telefone</label>
                    <p className="font-medium">{proprietario.telefone ? formatPhone(proprietario.telefone) : "Não informado"}</p>
                  </div>
                  {proprietario.celular && (
                    <div>
                      <label className="text-sm text-muted-foreground">Celular</label>
                      <p className="font-medium">{formatPhone(proprietario.celular)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            {proprietario.endereco_logradouro && (
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
                        {proprietario.endereco_logradouro}, {proprietario.endereco_numero}
                        {proprietario.endereco_complemento && ` - ${proprietario.endereco_complemento}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Bairro</label>
                      <p className="font-medium">{proprietario.endereco_bairro || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Cidade/UF</label>
                      <p className="font-medium">
                        {proprietario.endereco_cidade || "-"}/{proprietario.endereco_estado || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">CEP</label>
                      <p className="font-medium">{proprietario.endereco_cep || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dados Bancários */}
            {proprietario.banco && (
              <Card className="border-black/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Dados Bancários
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Banco</label>
                      <p className="font-medium">{proprietario.banco}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Agência</label>
                      <p className="font-medium">{proprietario.agencia || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Conta</label>
                      <p className="font-medium">{proprietario.conta || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Tipo de Conta</label>
                      <p className="font-medium">{proprietario.tipo_conta || "-"}</p>
                    </div>
                    {proprietario.pix && (
                      <div className="md:col-span-2">
                        <label className="text-sm text-muted-foreground">Chave PIX</label>
                        <p className="font-medium">{proprietario.pix}</p>
                      </div>
                    )}
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
            {proprietario.observacoes && (
              <Card className="border-black/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Observações</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proprietario.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Data de Cadastro */}
          {proprietario.created_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Cadastrado em {new Date(proprietario.created_at).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
