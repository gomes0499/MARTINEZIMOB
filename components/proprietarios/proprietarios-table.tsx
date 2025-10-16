"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ProprietarioForm } from "@/components/proprietarios/proprietario-form"
import { FilterBar } from "@/components/filter-bar"
import { Search, Edit, Trash2, Users, UserCheck, UserX, Building2 } from "lucide-react"
import { deleteProprietario, type Proprietario } from "@/lib/actions/proprietarios"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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

interface ProprietariosTableProps {
  initialData: Proprietario[]
}

export function ProprietariosTable({ initialData }: ProprietariosTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Proprietario | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tipoPessoaFilter, setTipoPessoaFilter] = useState("todos")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = (item: Proprietario) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const result = await deleteProprietario(deleteId)
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Proprietário excluído com sucesso",
      })
      router.refresh()
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir proprietário",
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

  const handleRowClick = (id: string) => {
    router.push(`/proprietarios/${id}`)
  }

  const filteredProprietarios = initialData.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf_cnpj.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "ativo" && p.ativo) ||
      (statusFilter === "inativo" && !p.ativo)

    const matchesTipoPessoa = tipoPessoaFilter === "todos" || p.tipo_pessoa === tipoPessoaFilter

    return matchesSearch && matchesStatus && matchesTipoPessoa
  })

  const stats = {
    total: initialData.length,
    ativos: initialData.filter((p) => p.ativo).length,
    inativos: initialData.filter((p) => !p.ativo).length,
    pessoaFisica: initialData.filter((p) => p.tipo_pessoa === "fisica").length,
    pessoaJuridica: initialData.filter((p) => p.tipo_pessoa === "juridica").length,
  }

  return (
    <>
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.inativos}</div>
                <p className="text-sm text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.pessoaJuridica}</div>
                <p className="text-sm text-muted-foreground">Pessoa Jurídica</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-black/10 overflow-hidden p-0">
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
      </Card>

      <Card className="border-black/10 hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md focus-visible:ring-black"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-black/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/10">
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">CPF/CNPJ</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProprietarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum proprietário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProprietarios.map((proprietario) => (
                  <TableRow
                    key={proprietario.id}
                    className="border-black/10 cursor-pointer hover:bg-black/5"
                    onClick={() => handleRowClick(proprietario.id)}
                  >
                    <TableCell>
                      <Badge variant="outline" className="border-black/20">
                        {proprietario.tipo_pessoa === "fisica" ? "PF" : "PJ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{proprietario.nome}</TableCell>
                    <TableCell>{formatCPFCNPJ(proprietario.cpf_cnpj)}</TableCell>
                    <TableCell>{proprietario.email}</TableCell>
                    <TableCell>{proprietario.telefone ? formatPhone(proprietario.telefone) : "Não informado"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={proprietario.ativo ? "default" : "secondary"}
                        className={proprietario.ativo ? "bg-black hover:bg-black/90" : ""}
                      >
                        {proprietario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(proprietario)}
                          className="hover:bg-black/5"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(proprietario.id)}
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
              Tem certeza que deseja excluir este proprietário? Esta ação não pode ser desfeita.
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

      {showForm && <ProprietarioForm onClose={handleFormClose} initialData={editingItem} />}
    </>
  )
}
