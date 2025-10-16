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
import { InquilinoForm } from "@/components/inquilinos/inquilino-form";
import { InquilinoDetailsSheet } from "@/components/inquilinos/inquilino-details-sheet";
import { FilterBar } from "@/components/filter-bar";
import { deleteInquilino, type Inquilino } from "@/lib/actions/inquilinos";
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

interface InquilinosDataTableProps {
  initialData: (Inquilino & { contratos_count?: number })[];
}

export function InquilinosDataTable({ initialData }: InquilinosDataTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Inquilino | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<Inquilino | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [tipoPessoaFilter, setTipoPessoaFilter] = useState("todos");
  const router = useRouter();
  const { toast } = useToast();

  const handleView = (item: Inquilino) => {
    setViewingItem(item);
    setShowSheet(true);
  };

  const handleEdit = (item: Inquilino) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const result = await deleteInquilino(deleteId);
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Inquilino excluído com sucesso",
      });
      router.refresh();
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao excluir inquilino",
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
    return initialData.filter((i) => {
      const matchesSearch =
        i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.cpf_cnpj.includes(searchTerm) ||
        i.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "ativo" && i.ativo) ||
        (statusFilter === "inativo" && !i.ativo);

      const matchesTipoPessoa =
        tipoPessoaFilter === "todos" || i.tipo_pessoa === tipoPessoaFilter;

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
              Tem certeza que deseja excluir este inquilino? Esta ação não pode
              ser desfeita.
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
        <InquilinoForm onClose={handleFormClose} initialData={editingItem} />
      )}

      <InquilinoDetailsSheet
        inquilino={viewingItem}
        open={showSheet}
        onOpenChange={setShowSheet}
      />
    </>
  );
}
