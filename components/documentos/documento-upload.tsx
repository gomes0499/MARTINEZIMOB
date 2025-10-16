"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, X } from "lucide-react"
import { createDocumento } from "@/lib/actions/documentos"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface DocumentoUploadProps {
  onClose?: () => void
  preSelectedEntidade?: {
    tipo: string
    id: string
  } | null
}

export function DocumentoUpload({ onClose, preSelectedEntidade }: DocumentoUploadProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    tipoEntidade: preSelectedEntidade?.tipo || "",
    entidadeId: preSelectedEntidade?.id || "",
    tipoDocumento: "",
    descricao: "",
    arquivo: null as File | null,
  })

  // Atualizar formData quando preSelectedEntidade mudar
  useEffect(() => {
    if (preSelectedEntidade) {
      setFormData((prev) => ({
        ...prev,
        tipoEntidade: preSelectedEntidade.tipo,
        entidadeId: preSelectedEntidade.id,
      }))
      setOpen(true)
    }
  }, [preSelectedEntidade])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.arquivo) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", formData.arquivo)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await uploadResponse.json()

      const result = await createDocumento({
        tipo_entidade: formData.tipoEntidade,
        entidade_id: parseInt(formData.entidadeId),
        tipo_documento: formData.tipoDocumento,
        nome_arquivo: formData.arquivo.name,
        url_arquivo: url,
        tamanho_bytes: formData.arquivo.size,
        categoria: null,
        observacoes: formData.descricao || null,
      })

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Documento enviado com sucesso",
        })

        const handleClose = () => {
          setFormData({
            tipoEntidade: "",
            entidadeId: "",
            tipoDocumento: "",
            descricao: "",
            arquivo: null,
          })
          setOpen(false)
          if (onClose) onClose()
        }

        handleClose()
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("[v0] Error uploading document:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar documento",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Tipos de documentos por entidade
  const getTiposDocumento = (tipoEntidade: string) => {
    switch (tipoEntidade) {
      case "proprietario":
        return ["RG/CPF", "CNPJ", "Comprovante de Residência", "Comprovante de Propriedade", "Certidão Negativa"]
      case "inquilino":
        return ["RG/CPF", "CNPJ", "Comprovante de Renda", "Comprovante de Residência", "Referências"]
      case "imovel":
        return ["IPTU", "Matrícula", "Fotos", "Planta/Projeto", "Laudo/Vistoria"]
      case "contrato":
        return [
          "Contrato Assinado",
          "Termo de Vistoria",
          "Comprovante de Caução",
          "Fiança",
          "Aditivo",
          "Documentos Fiador",
        ]
      default:
        return []
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setOpen(false)
    }
  }

  // Se onClose foi passado, renderizar como modal controlado externamente
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-black/10">
            <h2 className="text-lg font-semibold">Upload de Documento</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Documento *</Label>
              <Select
                value={formData.tipoDocumento}
                onValueChange={(value) => setFormData({ ...formData, tipoDocumento: value })}
                required
              >
                <SelectTrigger className="focus:ring-black">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {getTiposDocumento(formData.tipoEntidade).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo">Arquivo *</Label>
              <Input
                id="arquivo"
                type="file"
                onChange={(e) => setFormData({ ...formData, arquivo: e.target.files?.[0] || null })}
                required
                disabled={uploading}
                className="focus-visible:ring-black"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {formData.arquivo && (
                <p className="text-sm text-muted-foreground">
                  {formData.arquivo.name} ({(formData.arquivo.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                disabled={uploading}
                placeholder="Adicione observações sobre este documento..."
                className="focus-visible:ring-black"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading} className="bg-black hover:bg-black/90">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Renderizar como Dialog normal
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-black/90">
          <Upload className="mr-2 h-4 w-4" />
          Upload Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Entidade *</Label>
            <Select
              value={formData.tipoEntidade}
              onValueChange={(value) => setFormData({ ...formData, tipoEntidade: value, tipoDocumento: "" })}
            >
              <SelectTrigger className="focus:ring-black">
                <SelectValue placeholder="Selecione a entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proprietario">Proprietário</SelectItem>
                <SelectItem value="inquilino">Inquilino</SelectItem>
                <SelectItem value="imovel">Imóvel</SelectItem>
                <SelectItem value="contrato">Contrato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Documento *</Label>
            <Select
              value={formData.tipoDocumento}
              onValueChange={(value) => setFormData({ ...formData, tipoDocumento: value })}
              disabled={!formData.tipoEntidade}
            >
              <SelectTrigger className="focus:ring-black">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {getTiposDocumento(formData.tipoEntidade).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arquivo">Arquivo *</Label>
            <Input
              id="arquivo"
              type="file"
              onChange={(e) => setFormData({ ...formData, arquivo: e.target.files?.[0] || null })}
              required
              disabled={uploading}
              className="focus-visible:ring-black"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            {formData.arquivo && (
              <p className="text-sm text-muted-foreground">
                {formData.arquivo.name} ({(formData.arquivo.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              disabled={uploading}
              placeholder="Adicione observações sobre este documento..."
              className="focus-visible:ring-black"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading} className="bg-black hover:bg-black/90">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
