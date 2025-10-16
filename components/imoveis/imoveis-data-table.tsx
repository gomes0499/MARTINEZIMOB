"use client"

import { useState } from "react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ImovelForm } from "@/components/imoveis/imovel-form"
import { ImovelDetailsSheet } from "@/components/imoveis/imovel-details-sheet"
import { FilterBar } from "@/components/filter-bar"
import { deleteImovel } from "@/lib/actions/imoveis"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

interface ImoveisDataTableProps {
  initialImoveis: any[]
  proprietarios: any[]
}

export function ImoveisDataTable({ initialImoveis, proprietarios }: ImoveisDataTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [statusFilter, setStatusFilter] = useState("todos")
  const router = useRouter()
  const { toast } = useToast()

  const handleView = (item: any) => {
    setViewingItem(item)
    setShowSheet(true)
  }

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

  // Filtrar dados
  const filteredData = React.useMemo(() => {
    return initialImoveis.filter((imovel) => {
      const matchesSearch =
        imovel.endereco_logradouro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imovel.endereco_bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        imovel.proprietario_nome?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTipo = tipoFilter === "todos" || imovel.tipo === tipoFilter

      const matchesStatus = statusFilter === "todos" || imovel.status === statusFilter

      return matchesSearch && matchesTipo && matchesStatus
    })
  }, [initialImoveis, searchTerm, tipoFilter, statusFilter])

  return (
    <>
      {/* Card com Filtros e Tabela */}
      <Card className="border-black/10 overflow-hidden">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por endereço, bairro ou proprietário..."
          filters={[
            {
              value: tipoFilter,
              onValueChange: setTipoFilter,
              placeholder: "Tipo",
              options: [
                { value: "todos", label: "Todos os Tipos" },
                { value: "Apartamento", label: "Apartamento" },
                { value: "Casa", label: "Casa" },
                { value: "Comercial", label: "Comercial" },
                { value: "Terreno", label: "Terreno" },
              ],
            },
            {
              value: statusFilter,
              onValueChange: setStatusFilter,
              placeholder: "Status",
              options: [
                { value: "todos", label: "Todos os Status" },
                { value: "disponivel", label: "Disponível" },
                { value: "locado", label: "Locado" },
                { value: "manutencao", label: "Manutenção" },
                { value: "inativo", label: "Inativo" },
              ],
            },
          ]}
        />
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={filteredData}
            onRowClick={handleView}
            meta={{
              onView: handleView,
              onEdit: handleEdit,
              onDelete: setDeleteId,
            }}
          />
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

      <ImovelDetailsSheet
        imovel={viewingItem}
        open={showSheet}
        onOpenChange={setShowSheet}
      />
    </>
  )
}
