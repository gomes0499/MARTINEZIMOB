"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Phone, Mail, MessageSquare, Calendar, Trash2 } from "lucide-react"
import { deleteInteracao } from "@/lib/actions/interacoes"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Interacao {
  id: string
  tipo_entidade: string
  entidade_id: string
  tipo_interacao: string
  assunto: string
  descricao: string | null
  data_interacao: string
  created_at: string
}

interface InteracoesTimelineProps {
  interacoes: Interacao[]
}

export function InteracoesTimeline({ interacoes: initialInteracoes }: InteracoesTimelineProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")

  const filteredInteracoes = initialInteracoes.filter((int) => {
    const matchesSearch =
      int.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (int.descricao && int.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTipo = tipoFilter === "todos" || int.tipo_interacao === tipoFilter
    const matchesCategoria = categoriaFilter === "todos" || int.tipo_entidade === categoriaFilter
    return matchesSearch && matchesTipo && matchesCategoria
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta interação?")) return

    const result = await deleteInteracao(id)
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Interação excluída com sucesso",
      })
      router.refresh()
    } else {
      toast({
        title: "Erro",
        description: "error" in result ? result.error : "Erro ao excluir interação",
        variant: "destructive",
      })
    }
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "ligacao":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />
      case "visita":
      case "reuniao":
        return <Calendar className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar interações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="ligacao">Ligação</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="visita">Visita</SelectItem>
            <SelectItem value="reuniao">Reunião</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            <SelectItem value="proprietario">Proprietário</SelectItem>
            <SelectItem value="inquilino">Inquilino</SelectItem>
            <SelectItem value="imovel">Imóvel</SelectItem>
            <SelectItem value="contrato">Contrato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredInteracoes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">Nenhuma interação encontrada</CardContent>
          </Card>
        ) : (
          filteredInteracoes.map((int) => (
            <Card key={int.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="mt-1">{getIcon(int.tipo_interacao)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{int.assunto}</h3>
                        <Badge variant="outline" className="capitalize">
                          {int.tipo_interacao}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {int.tipo_entidade}
                        </Badge>
                      </div>
                      {int.descricao && <p className="text-sm text-muted-foreground mb-2">{int.descricao}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(int.data_interacao)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(int.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
