"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProprietarioForm } from "@/components/proprietarios/proprietario-form";
import { ProprietarioDetailsDrawer } from "@/components/proprietarios/proprietario-details-drawer";
import { FilterBar } from "@/components/filter-bar";
import {
  deleteProprietario,
  type Proprietario,
} from "@/lib/actions/proprietarios";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import * as React from "react";

interface ProprietariosDataTableProps {
  initialData: Proprietario[];
}

export function ProprietariosDataTable({
  initialData,
}: ProprietariosDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Proprietario | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<Proprietario | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [tipoPessoaFilter, setTipoPessoaFilter] = useState("todos");
  const router = useRouter();
  const { toast } = useToast();

  const handleView = (item: Proprietario) => {
    setViewingItem(item);
    setShowDrawer(true);
  };

  const handleEdit = (item: Proprietario) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const result = await deleteProprietario(deleteId);
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Proprietário excluído com sucesso",
      });
      router.refresh();
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir proprietário",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    router.refresh();
  };

  // Filtrar dados
  const filteredData = React.useMemo(() => {
    return initialData.filter((p) => {
      const matchesSearch =
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cpf_cnpj.includes(searchTerm) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "ativo" && p.ativo) ||
        (statusFilter === "inativo" && !p.ativo);

      const matchesTipoPessoa =
        tipoPessoaFilter === "todos" || p.tipo_pessoa === tipoPessoaFilter;

      return matchesSearch && matchesStatus && matchesTipoPessoa;
    });
  }, [initialData, searchTerm, statusFilter, tipoPessoaFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      onView: handleView,
      onEdit: handleEdit,
      onDelete: setDeleteId,
    },
  });

  return (
    <>
      {/* Card com Filtros e Tabela */}
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
          <DataTable
            columns={columns}
            data={filteredData}
            onRowClick={handleView}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este proprietário? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showForm && (
        <ProprietarioForm onClose={handleFormClose} initialData={editingItem} />
      )}

      <ProprietarioDetailsDrawer
        proprietario={viewingItem}
        open={showDrawer}
        onOpenChange={setShowDrawer}
      />
    </>
  );
}
