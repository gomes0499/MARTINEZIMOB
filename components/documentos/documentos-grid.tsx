"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  Home,
  Users,
  UserCircle,
  FileSignature,
  Image,
  File,
} from "lucide-react"
import { DocumentoUpload } from "./documento-upload"

interface DocumentosGridProps {
  documentos: any[]
  tipoEntidade?: string
  entidades: {
    proprietarios: any[]
    inquilinos: any[]
    imoveis: any[]
    contratos: any[]
  }
}

export function DocumentosGrid({ documentos, tipoEntidade, entidades }: DocumentosGridProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [selectedEntidade, setSelectedEntidade] = useState<{ tipo: string; id: string } | null>(null)

  // Agrupar documentos por entidade
  const documentosAgrupados = useMemo(() => {
    const grupos: Record<string, any[]> = {}

    documentos.forEach((doc) => {
      const key = `${doc.tipo_entidade}-${doc.entidade_id}`
      if (!grupos[key]) {
        grupos[key] = []
      }
      grupos[key].push(doc)
    })

    return grupos
  }, [documentos])

  // Obter nome da entidade
  const getEntidadeNome = (tipo: string, id: string) => {
    switch (tipo) {
      case "proprietario":
        const prop = entidades.proprietarios.find((p) => p.id === id)
        return prop?.nome || "Proprietário não encontrado"
      case "inquilino":
        const inq = entidades.inquilinos.find((i) => i.id === id)
        return inq?.nome || "Inquilino não encontrado"
      case "imovel":
        const imovel = entidades.imoveis.find((i) => i.id === id)
        return imovel?.endereco_complemento || `${imovel?.endereco_logradouro}, ${imovel?.endereco_numero}` || "Imóvel não encontrado"
      case "contrato":
        const contrato = entidades.contratos.find((c) => c.id === id)
        if (contrato) {
          const imovelContrato = entidades.imoveis.find((i) => i.id === contrato.imovel_id)
          return `Contrato - ${imovelContrato?.endereco_complemento || "Imóvel"}` || "Contrato não encontrado"
        }
        return "Contrato não encontrado"
      default:
        return "Entidade não encontrada"
    }
  }

  // Obter ícone da entidade
  const getEntidadeIcon = (tipo: string) => {
    switch (tipo) {
      case "proprietario":
        return <UserCircle className="w-5 h-5 text-blue-600" />
      case "inquilino":
        return <Users className="w-5 h-5 text-green-600" />
      case "imovel":
        return <Home className="w-5 h-5 text-purple-600" />
      case "contrato":
        return <FileSignature className="w-5 h-5 text-orange-600" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  // Obter ícone do tipo de arquivo
  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/")) {
      return <Image className="w-5 h-5 text-blue-500" />
    }
    if (mimeType?.includes("pdf")) {
      return <FileText className="w-5 h-5 text-red-500" />
    }
    return <File className="w-5 h-5 text-gray-500" />
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  if (documentos.length === 0) {
    return (
      <Card className="border-black/10">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tipoEntidade
                ? `Não há documentos cadastrados para ${tipoEntidade}s ainda.`
                : "Não há documentos cadastrados ainda."}
            </p>
            <Button onClick={() => setShowUpload(true)} className="bg-black hover:bg-black/90">
              <Upload className="w-4 h-4 mr-2" />
              Fazer Upload
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {Object.entries(documentosAgrupados).map(([key, docs]) => {
        const [tipo, id] = key.split("-")
        const entidadeNome = getEntidadeNome(tipo, id)

        return (
          <Card key={key} className="border-black/10">
            <CardHeader className="border-b border-black/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getEntidadeIcon(tipo)}
                  <div>
                    <CardTitle className="text-lg">{entidadeNome}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {docs.length} documento{docs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEntidade({ tipo, id })
                    setShowUpload(true)
                  }}
                  className="border-black/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-black/10 rounded-lg p-4 hover:bg-black/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getFileIcon(doc.mime_type)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{doc.tipo_documento}</h4>
                        <p className="text-sm text-muted-foreground truncate">{doc.nome_arquivo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs border-black/20">
                            {formatBytes(doc.tamanho_bytes || 0)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</span>
                        </div>
                        {doc.descricao && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{doc.descricao}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-black/10"
                            onClick={() => window.open(doc.url_arquivo, "_blank")}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-black/10"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = doc.url_arquivo
                              link.download = doc.nome_arquivo
                              link.click()
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {showUpload && (
        <DocumentoUpload
          onClose={() => {
            setShowUpload(false)
            setSelectedEntidade(null)
          }}
          preSelectedEntidade={selectedEntidade}
        />
      )}
    </div>
  )
}
