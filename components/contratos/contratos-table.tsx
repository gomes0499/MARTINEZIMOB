"use client"

import { useState, useEffect } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterBar } from "@/components/filter-bar"
import { ContratoWizard } from "@/components/contratos/contrato-wizard"
import { ContratoDetailsSheet } from "@/components/contratos/contrato-details-sheet"
import { Eye, FileText, Calendar, TrendingUp, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { createContrato } from "@/lib/actions/contratos"
import { useToast } from "@/hooks/use-toast"

interface ContratosTableProps {
  initialContratos: any[]
  imoveis: any[]
  inquilinos: any[]
}

export function ContratosTable({ initialContratos, imoveis, inquilinos }: ContratosTableProps) {
  const [showWizard, setShowWizard] = useState(false)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [contratos, setContratos] = useState(initialContratos)
  const { toast } = useToast()

  const handleView = (contrato: any) => {
    setViewingItem(contrato)
    setShowSheet(true)
  }

  useEffect(() => {
    const handleOpenForm = () => setShowWizard(true)
    window.addEventListener("open-contrato-form", handleOpenForm)
    return () => window.removeEventListener("open-contrato-form", handleOpenForm)
  }, [])

  const handleSave = async (data: any) => {
    try {
      const result = await createContrato(data)

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Contrato criado com sucesso.",
        })
        setShowWizard(false)
        // Refresh the page to show new data
        window.location.reload()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao criar contrato.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating contrato:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar contrato.",
        variant: "destructive",
      })
    }
  }

  const filteredContratos = React.useMemo(() => {
    return contratos.filter((c) => {
      const matchesSearch =
        c.imovel_endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.inquilino_nome?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "todos" || c.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [contratos, searchTerm, statusFilter])

  const formatCpfCnpj = (cpfCnpj: string) => {
    const cleaned = cpfCnpj.replace(/\D/g, "")
    if (cleaned.length === 11) {
      // CPF: 000.000.000-00
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else if (cleaned.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return cpfCnpj
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; label: string; className?: string }
    > = {
      ativo: { variant: "default", label: "Ativo", className: "bg-green-600 hover:bg-green-600/90" },
      encerrado: { variant: "secondary", label: "Encerrado" },
      cancelado: { variant: "destructive", label: "Cancelado" },
    }
    const config = variants[status] || variants.ativo
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const stats = {
    total: contratos.length,
    ativos: contratos.filter((c) => c.status === "ativo").length,
    vencendo: 0,
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black/5 rounded-lg">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total de Contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
                <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.vencendo}</div>
                <p className="text-sm text-muted-foreground">Vencendo em 30 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card com Filtros e Tabela */}
      <Card className="border-black/10 overflow-hidden">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por imóvel ou inquilino..."
          filters={[
            {
              value: statusFilter,
              onValueChange: setStatusFilter,
              placeholder: "Status",
              options: [
                { value: "todos", label: "Todos os Status" },
                { value: "ativo", label: "Ativo" },
                { value: "encerrado", label: "Encerrado" },
                { value: "cancelado", label: "Cancelado" },
              ],
            },
          ]}
        />
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/10">
                <TableHead className="font-semibold">Imóvel</TableHead>
                <TableHead className="font-semibold">Inquilino</TableHead>
                <TableHead className="font-semibold">Período</TableHead>
                <TableHead className="font-semibold">Valor Aluguel</TableHead>
                <TableHead className="font-semibold">Vencimento</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContratos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredContratos.map((contrato) => (
                  <TableRow
                    key={contrato.id}
                    className="border-black/10 cursor-pointer hover:bg-black/5"
                    onClick={() => handleView(contrato)}
                  >
                    <TableCell className="max-w-[300px]">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium truncate">{contrato.imovel_nome || "Sem identificação"}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {contrato.imovel_endereco}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium truncate">{contrato.inquilino_nome || "Não informado"}</div>
                        {contrato.inquilino_cpf_cnpj && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {formatCpfCnpj(contrato.inquilino_cpf_cnpj)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm font-medium">
                          {new Date(contrato.data_inicio).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          até {new Date(contrato.data_fim).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                          contrato.valor_aluguel,
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">Dia {contrato.dia_vencimento}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(contrato.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:bg-black/5"
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
                              handleView(contrato)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implement edit
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implement delete
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showWizard && (
        <ContratoWizard
          onClose={() => setShowWizard(false)}
          onSave={handleSave}
          imoveis={imoveis}
          inquilinos={inquilinos}
        />
      )}

      <ContratoDetailsSheet
        contrato={viewingItem}
        open={showSheet}
        onOpenChange={setShowSheet}
      />
    </>
  )
}
