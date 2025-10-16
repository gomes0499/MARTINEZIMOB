"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Trash2, ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"

export type Imovel = {
  id: string
  tipo: string
  endereco_logradouro: string
  endereco_numero: string
  endereco_bairro: string
  valor_aluguel: number
  status: string
  proprietario_nome?: string
}

export const columns: ColumnDef<Imovel>[] = [
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      return <Badge variant="outline" className="border-black/20">{row.getValue("tipo")}</Badge>
    },
  },
  {
    accessorKey: "endereco_logradouro",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Endereço
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const logradouro = row.getValue("endereco_logradouro") as string
      const numero = row.original.endereco_numero
      const bairro = row.original.endereco_bairro
      return (
        <div className="flex flex-col gap-0.5 max-w-[400px]">
          <div className="font-medium truncate">{logradouro}, {numero}</div>
          <div className="text-xs text-muted-foreground">{bairro}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "proprietario_nome",
    header: "Proprietário",
    cell: ({ row }) => {
      const nome = row.getValue("proprietario_nome") as string
      return (
        <div className="max-w-[250px]">
          <div className="font-medium truncate">{nome || "Não informado"}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "valor_aluguel",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("valor_aluguel"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
        disponivel: { label: "Disponível", variant: "secondary" },
        locado: { label: "Locado", variant: "default" },
        manutencao: { label: "Manutenção", variant: "destructive" },
        inativo: { label: "Inativo", variant: "secondary" },
      }
      const statusInfo = statusMap[status] || statusMap.disponivel
      return (
        <Badge
          variant={statusInfo.variant}
          className={statusInfo.variant === "default" ? "bg-black hover:bg-black/90" : ""}
        >
          {statusInfo.label}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const imovel = row.original
      const meta = table.options.meta as any

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  meta?.onView?.(imovel)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  meta?.onEdit?.(imovel)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  meta?.onDelete?.(imovel.id)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
