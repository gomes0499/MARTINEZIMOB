"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImovelForm } from "@/components/imoveis/imovel-form"
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react"
import { deleteImovel } from "@/lib/actions/imoveis"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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

interface ImoveisTableProps {
  initialImoveis: any[]
  proprietarios: any[]
}

export function ImoveisTable({ initialImoveis, proprietarios }: ImoveisTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleOpenForm = () => setShowForm(true)
    window.addEventListener("open-imovel-form", handleOpenForm)
    return () => window.removeEventListener("open-imovel-form", handleOpenForm)
  }, [])

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const result = await deleteImovel(deleteId)
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Imóvel excluído com sucesso",
      })
      router.refresh()
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir imóvel",
        variant: "destructive",
      })
    }
    setDeleteId(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
    router.refresh()
  }

  const filteredImoveis = initialImoveis.filter((i) => {
    const matchesSearch =
      i.endereco_logradouro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.endereco_bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.endereco_cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.proprietario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.tipo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || i.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }
    > = {
      disponivel: { variant: "default", label: "Disponível", className: "bg-green-600 hover:bg-green-600/90" },
      locado: { variant: "default", label: "Locado", className: "bg-black hover:bg-black/90" },
      manutencao: { variant: "outline", label: "Manutenção" },
      inativo: { variant: "destructive", label: "Inativo" },
    }
    const config = variants[status] || variants.disponivel
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const stats = {
    total: initialImoveis.length,
    disponiveis: initialImoveis.filter((i) => i.status === "disponivel").length,
    locados: initialImoveis.filter((i) => i.status === "locado").length,
    manutencao: initialImoveis.filter((i) => i.status === "manutencao").length,
  }

  return (
    <>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total de Imóveis</p>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.disponiveis}</div>
            <p className="text-sm text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.locados}</div>
            <p className="text-sm text-muted-foreground">Locados</p>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.manutencao}</div>
            <p className="text-sm text-muted-foreground">Em Manutenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6 border-black/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por endereço, bairro, cidade, proprietário ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus-visible:ring-black"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 focus:ring-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="locado">Locado</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="border-black/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/10">
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Endereço</TableHead>
                <TableHead className="font-semibold">Proprietário</TableHead>
                <TableHead className="font-semibold">Características</TableHead>
                <TableHead className="font-semibold">Valor Aluguel</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImoveis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum imóvel encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredImoveis.map((imovel) => (
                  <TableRow key={imovel.id} className="border-black/10">
                    <TableCell>
                      <Badge variant="outline" className="border-black/20">
                        {imovel.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">
                            {imovel.endereco_logradouro}, {imovel.endereco_numero}
                          </div>
                          <div className="text-muted-foreground">
                            {imovel.endereco_bairro} - {imovel.endereco_cidade}/{imovel.endereco_estado}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{imovel.proprietario_nome}</TableCell>
                    <TableCell className="text-sm">
                      {imovel.quartos} quarto{imovel.quartos !== 1 ? "s" : ""} • {imovel.banheiros} banheiro
                      {imovel.banheiros !== 1 ? "s" : ""} • {imovel.vagas_garagem} vaga
                      {imovel.vagas_garagem !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        imovel.valor_aluguel,
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(imovel.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(imovel)}
                          className="hover:bg-black/5"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(imovel.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
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

      {showForm && <ImovelForm onClose={handleFormClose} initialData={editingItem} proprietarios={proprietarios} />}
    </>
  )
}
