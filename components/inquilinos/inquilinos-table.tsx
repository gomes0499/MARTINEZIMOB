"use client"

import { useState } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { InquilinoForm } from "@/components/inquilinos/inquilino-form"
import { FilterBar } from "@/components/filter-bar"
import { Edit, Trash2, FileText } from "lucide-react"
import { deleteInquilino } from "@/lib/actions/inquilinos"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface InquilinosTableProps {
  initialInquilinos: any[]
}

export function InquilinosTable({ initialInquilinos }: InquilinosTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tipoPessoaFilter, setTipoPessoaFilter] = useState("todos")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const result = await deleteInquilino(deleteId)
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Inquilino excluído com sucesso",
      })
      router.refresh()
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir inquilino",
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

  const filteredInquilinos = React.useMemo(() => {
    return initialInquilinos.filter((i) => {
      const matchesSearch =
        i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.cpf_cnpj.includes(searchTerm) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "ativo" && i.ativo) ||
        (statusFilter === "inativo" && !i.ativo)

      const matchesTipoPessoa =
        tipoPessoaFilter === "todos" || i.tipo_pessoa === tipoPessoaFilter

      return matchesSearch && matchesStatus && matchesTipoPessoa
    })
  }, [initialInquilinos, searchTerm, statusFilter, tipoPessoaFilter])

  return (
    <>
      <Card className="border-black/10 overflow-hidden">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nome, CPF/CNPJ ou email..."
          filters={[
            {
              value: statusFilter,
              onValueChange: setStatusFilter,
              placeholder: "Status",
              options: [
                { value: "todos", label: "Todos os Status" },
                { value: "ativo", label: "Ativos" },
                { value: "inativo", label: "Inativos" },
              ],
            },
            {
              value: tipoPessoaFilter,
              onValueChange: setTipoPessoaFilter,
              placeholder: "Tipo de Pessoa",
              options: [
                { value: "todos", label: "Todos os Tipos" },
                { value: "fisica", label: "Pessoa Física" },
                { value: "juridica", label: "Pessoa Jurídica" },
              ],
            },
          ]}
        />
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/10">
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">CPF/CNPJ</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Profissão</TableHead>
                <TableHead className="font-semibold">Contratos</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquilinos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum inquilino encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredInquilinos.map((inquilino) => (
                  <TableRow key={inquilino.id} className="border-black/10">
                    <TableCell>
                      <Badge variant="outline" className="border-black/20">
                        {inquilino.tipo_pessoa}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{inquilino.nome}</TableCell>
                    <TableCell>{inquilino.cpf_cnpj}</TableCell>
                    <TableCell>{inquilino.email}</TableCell>
                    <TableCell>{inquilino.telefone}</TableCell>
                    <TableCell>{inquilino.profissao || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{inquilino.contratos_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={inquilino.ativo ? "default" : "secondary"}
                        className={inquilino.ativo ? "bg-black hover:bg-black/90" : ""}
                      >
                        {inquilino.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(inquilino)}
                          className="hover:bg-black/5"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(inquilino.id)}
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
              Tem certeza que deseja excluir este inquilino? Esta ação não pode ser desfeita.
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

      {showForm && <InquilinoForm onClose={handleFormClose} initialData={editingItem} />}
    </>
  )
}
