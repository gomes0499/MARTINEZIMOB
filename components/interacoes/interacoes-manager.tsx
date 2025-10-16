"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Search,
  Plus,
  UserCircle,
  Users,
  Home,
  FileSignature,
} from "lucide-react"
import { InteracaoForm } from "./interacao-form"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface InteracoesManagerProps {
  interacoes: any[]
  proprietarios: any[]
  inquilinos: any[]
  imoveis: any[]
  contratos: any[]
}

export function InteracoesManager({
  interacoes,
  proprietarios,
  inquilinos,
  imoveis,
  contratos,
}: InteracoesManagerProps) {
  const [showNovaInteracao, setShowNovaInteracao] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [categoriaFilter, setCategoriaFilter] = useState("todos")

  // Filtrar interações
  const interacoesFiltradas = useMemo(() => {
    return interacoes.filter((int) => {
      const searchableText = `${int.assunto || ""} ${int.descricao || ""}`.toLowerCase()
      const matchesSearch = searchableText.includes(searchTerm.toLowerCase())
      const matchesTipo =
        tipoFilter === "todos" || int.tipo_interacao === tipoFilter
      const matchesCategoria =
        categoriaFilter === "todos" || int.tipo_entidade === categoriaFilter

      return matchesSearch && matchesTipo && matchesCategoria
    })
  }, [interacoes, searchTerm, tipoFilter, categoriaFilter])

  // Calcular stats
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const stats = {
    total: interacoes.length,
    hoje: interacoes.filter((int) => {
      const dataInt = new Date(int.data_interacao)
      dataInt.setHours(0, 0, 0, 0)
      return dataInt.getTime() === hoje.getTime()
    }).length,
    esteMes: interacoes.filter((int) => {
      const dataInt = new Date(int.data_interacao)
      return (
        dataInt.getMonth() === hoje.getMonth() &&
        dataInt.getFullYear() === hoje.getFullYear()
      )
    }).length,
  }

  // Obter ícone do tipo de interação
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "ligacao":
        return <Phone className="w-4 h-4" />
      case "email":
        return <Mail className="w-4 h-4" />
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />
      case "visita":
        return <Eye className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  // Obter cor do badge do tipo
  const getTipoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case "ligacao":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "email":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "whatsapp":
        return "bg-green-50 text-green-700 border-green-200"
      case "visita":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Obter ícone da entidade
  const getEntidadeIcon = (tipo: string) => {
    switch (tipo) {
      case "proprietario":
        return <UserCircle className="w-4 h-4 text-blue-600" />
      case "inquilino":
        return <Users className="w-4 h-4 text-green-600" />
      case "imovel":
        return <Home className="w-4 h-4 text-purple-600" />
      case "contrato":
        return <FileSignature className="w-4 h-4 text-orange-600" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  // Obter nome da entidade
  const getEntidadeNome = (tipo: string, id: string) => {
    switch (tipo) {
      case "proprietario":
        const prop = proprietarios.find((p) => p.id === id)
        return prop?.nome || "Proprietário não encontrado"
      case "inquilino":
        const inq = inquilinos.find((i) => i.id === id)
        return inq?.nome || "Inquilino não encontrado"
      case "imovel":
        const imovel = imoveis.find((i) => i.id === id)
        return imovel?.endereco_complemento || `${imovel?.endereco_logradouro}` || "Imóvel não encontrado"
      case "contrato":
        return "Contrato"
      default:
        return "Entidade não encontrada"
    }
  }

  const formatTipo = (tipo: string) => {
    const tipos: Record<string, string> = {
      ligacao: "Ligação",
      email: "E-mail",
      whatsapp: "WhatsApp",
      visita: "Visita",
      outros: "Outros",
    }
    return tipos[tipo] || tipo
  }

  const formatData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return data
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black/5 rounded-lg">
                <MessageSquare className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total de Interações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.hoje}</div>
                <p className="text-sm text-muted-foreground">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.esteMes}</div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Nova Interação */}
      <Card className="border-black/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar interações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus-visible:ring-black"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-48 focus:ring-black">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="ligacao">Ligação</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="visita">Visita</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full md:w-48 focus:ring-black">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Categorias</SelectItem>
                <SelectItem value="proprietario">Proprietários</SelectItem>
                <SelectItem value="inquilino">Inquilinos</SelectItem>
                <SelectItem value="imovel">Imóveis</SelectItem>
                <SelectItem value="contrato">Contratos</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowNovaInteracao(true)}
              className="bg-black hover:bg-black/90 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Interação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-black/10">
        <CardContent className="p-6">
          {interacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma interação encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece registrando sua primeira interação
              </p>
              <Button onClick={() => setShowNovaInteracao(true)} className="bg-black hover:bg-black/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Interação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interacoesFiltradas.map((interacao, index) => (
                <div key={interacao.id} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                      {getTipoIcon(interacao.tipo_interacao)}
                    </div>
                    {index < interacoesFiltradas.length - 1 && (
                      <div className="w-0.5 flex-1 bg-black/10 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="border border-black/10 rounded-lg p-4 hover:bg-black/5 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEntidadeIcon(interacao.tipo_entidade)}
                          <span className="font-medium">
                            {getEntidadeNome(interacao.tipo_entidade, interacao.entidade_id)}
                          </span>
                          <Badge variant="outline" className={getTipoBadgeClass(interacao.tipo_interacao)}>
                            {formatTipo(interacao.tipo_interacao)}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatData(interacao.data_interacao)}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{interacao.assunto}</h4>
                      <p className="text-sm text-muted-foreground">{interacao.descricao}</p>
                      {interacao.usuario_responsavel && (
                        <div className="mt-2 pt-2 border-t border-black/10">
                          <span className="text-xs text-muted-foreground">
                            Por: {interacao.usuario_responsavel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nova Interação */}
      {showNovaInteracao && (
        <InteracaoForm
          onClose={() => setShowNovaInteracao(false)}
          proprietarios={proprietarios}
          inquilinos={inquilinos}
          imoveis={imoveis}
          contratos={contratos}
        />
      )}
    </div>
  )
}
