"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Trash2, Search } from "lucide-react"
import { deleteDocumento } from "@/lib/actions/documentos"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Documento {
  id: number
  tipo_entidade: string
  entidade_id: number
  tipo_documento: string
  nome_arquivo: string
  url_arquivo: string
  tamanho_bytes: number
  categoria: string | null
  observacoes: string | null
  created_at: string
}

interface DocumentosTableProps {
  documentos: Documento[]
}

export function DocumentosTable({ documentos: initialDocumentos }: DocumentosTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filteredDocumentos = initialDocumentos.filter((doc) => {
    const matchesSearch = doc.nome_arquivo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = tipoFilter === "todos" || doc.tipo_documento === tipoFilter
    const matchesCategoria = categoriaFilter === "todos" || doc.categoria === categoriaFilter
    return matchesSearch && matchesTipo && matchesCategoria
  })

  const handleDelete = async () => {
    if (deleteId === null) return

    const result = await deleteDocumento(deleteId)
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      })
      router.refresh()
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir documento",
        variant: "destructive",
      })
    }
    setDeleteId(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const getTipoDocumentoBadge = (tipo: string) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline"; className?: string }> =
      {
        contrato: { label: "Contrato", variant: "default", className: "bg-black hover:bg-black/90" },
        comprovante: { label: "Comprovante", variant: "secondary" },
        identidade: { label: "Identidade", variant: "outline" },
        outros: { label: "Outros", variant: "outline" },
      }
    const badge = badges[tipo] || badges.outros
    return (
      <Badge variant={badge.variant} className={badge.className}>
        {badge.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 focus-visible:ring-black"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px] focus:ring-black">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="contrato">Contrato</SelectItem>
            <SelectItem value="comprovante">Comprovante</SelectItem>
            <SelectItem value="identidade">Identidade</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[180px] focus:ring-black">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            <SelectItem value="proprietario">Proprietário</SelectItem>
            <SelectItem value="inquilino">Inquilino</SelectItem>
            <SelectItem value="imovel">Imóvel</SelectItem>
            <SelectItem value="contrato">Contrato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-black/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-black/10">
              <TableHead className="font-semibold">Nome do Arquivo</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Tamanho</TableHead>
              <TableHead className="font-semibold">Data</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocumentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum documento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredDocumentos.map((doc) => (
                <TableRow key={doc.id} className="border-black/10">
                  <TableCell className="font-medium">{doc.nome_arquivo}</TableCell>
                  <TableCell>{getTipoDocumentoBadge(doc.tipo_documento)}</TableCell>
                  <TableCell className="capitalize">{doc.categoria || "-"}</TableCell>
                  <TableCell>{formatFileSize(doc.tamanho_bytes)}</TableCell>
                  <TableCell>{new Date(doc.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(doc.url_arquivo, "_blank")}
                        className="hover:bg-black/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const a = document.createElement("a")
                          a.href = doc.url_arquivo
                          a.download = doc.nome_arquivo
                          a.click()
                        }}
                        className="hover:bg-black/5"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(doc.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita e o arquivo será removido
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
