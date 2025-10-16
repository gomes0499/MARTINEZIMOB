"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"
import { Inquilino } from "@/lib/actions/inquilinos"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  if (!value) return ''
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

export const columns: ColumnDef<Inquilino>[] = [
  {
    accessorKey: "tipo_pessoa",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo_pessoa") as string
      return (
        <Badge variant="outline" className="border-black/20">
          {tipo === "PF" ? "PF" : "PJ"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "nome",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("nome")}</div>
    },
  },
  {
    accessorKey: "cpf_cnpj",
    header: "CPF/CNPJ",
    cell: ({ row }) => {
      return formatCPFCNPJ(row.getValue("cpf_cnpj"))
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => {
      return formatPhone(row.getValue("telefone"))
    },
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => {
      const ativo = row.getValue("ativo") as boolean
      return (
        <Badge
          variant={ativo ? "default" : "secondary"}
          className={ativo ? "bg-black hover:bg-black/90" : ""}
        >
          {ativo ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const inquilino = row.original
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
                  meta?.onView?.(inquilino)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  meta?.onEdit?.(inquilino)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  meta?.onDelete?.(inquilino.id)
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
