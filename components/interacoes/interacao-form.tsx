"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import { createInteracao } from "@/lib/actions/interacoes"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface InteracaoFormProps {
  onClose?: () => void
  proprietarios?: any[]
  inquilinos?: any[]
  imoveis?: any[]
  contratos?: any[]
}

export function InteracaoForm({ onClose, proprietarios = [], inquilinos = [], imoveis = [], contratos = [] }: InteracaoFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipoEntidade: "",
    entidadeId: "",
    tipoInteracao: "",
    assunto: "",
    descricao: "",
    usuarioResponsavel: "",
    data: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const dataInteracao = `${formData.data}T${formData.hora}:00`

    const result = await createInteracao({
      tipo_entidade: formData.tipoEntidade,
      entidade_id: formData.entidadeId,
      tipo_interacao: formData.tipoInteracao,
      assunto: formData.assunto,
      descricao: formData.descricao || null,
      data_interacao: dataInteracao,
      usuario_responsavel: formData.usuarioResponsavel || null,
    })

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Interação registrada com sucesso",
      })

      const resetForm = () => {
        setFormData({
          tipoEntidade: "",
          entidadeId: "",
          tipoInteracao: "",
          assunto: "",
          descricao: "",
          usuarioResponsavel: "",
          data: new Date().toISOString().split("T")[0],
          hora: new Date().toTimeString().slice(0, 5),
        })
      }

      resetForm()
      if (onClose) {
        onClose()
      } else {
        setOpen(false)
      }
      router.refresh()
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao registrar interação",
        variant: "destructive",
      })
    }
  }

  // Obter lista de entidades baseado no tipo selecionado
  const getEntidadesOptions = () => {
    switch (formData.tipoEntidade) {
      case "proprietario":
        return proprietarios.map((p) => ({ id: p.id, nome: p.nome }))
      case "inquilino":
        return inquilinos.map((i) => ({ id: i.id, nome: i.nome }))
      case "imovel":
        return imoveis.map((i) => ({
          id: i.id,
          nome: i.endereco_complemento || `${i.endereco_logradouro}, ${i.endereco_numero}`
        }))
      case "contrato":
        return contratos.map((c) => ({
          id: c.id,
          nome: `Contrato - ${c.imovel_endereco || c.id.substring(0, 8)}`
        }))
      default:
        return []
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Entidade *</Label>
          <Select
            value={formData.tipoEntidade}
            onValueChange={(value) =>
              setFormData({ ...formData, tipoEntidade: value, entidadeId: "" })
            }
            required
          >
            <SelectTrigger className="focus:ring-black">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proprietario">Proprietário</SelectItem>
              <SelectItem value="inquilino">Inquilino</SelectItem>
              <SelectItem value="imovel">Imóvel</SelectItem>
              <SelectItem value="contrato">Contrato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Entidade *</Label>
          <Select
            value={formData.entidadeId}
            onValueChange={(value) => setFormData({ ...formData, entidadeId: value })}
            disabled={!formData.tipoEntidade}
            required
          >
            <SelectTrigger className="focus:ring-black">
              <SelectValue placeholder="Selecione a entidade" />
            </SelectTrigger>
            <SelectContent>
              {getEntidadesOptions().map((ent) => (
                <SelectItem key={ent.id} value={ent.id}>
                  {ent.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Interação *</Label>
        <Select
          value={formData.tipoInteracao}
          onValueChange={(value) => setFormData({ ...formData, tipoInteracao: value })}
          required
        >
          <SelectTrigger className="focus:ring-black">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ligacao">Ligação</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="visita">Visita</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Assunto *</Label>
        <Input
          value={formData.assunto}
          onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
          placeholder="Ex: Proposta de locação, Solicitação de reparo..."
          required
          className="focus-visible:ring-black"
        />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          rows={4}
          placeholder="Descreva os detalhes da interação..."
          className="focus-visible:ring-black"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Data *</Label>
          <Input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            required
            className="focus-visible:ring-black"
          />
        </div>
        <div className="space-y-2">
          <Label>Hora *</Label>
          <Input
            type="time"
            value={formData.hora}
            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            required
            className="focus-visible:ring-black"
          />
        </div>
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Input
            value={formData.usuarioResponsavel}
            onChange={(e) => setFormData({ ...formData, usuarioResponsavel: e.target.value })}
            placeholder="Nome"
            className="focus-visible:ring-black"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onClose) onClose()
            else setOpen(false)
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" className="bg-black hover:bg-black/90">
          <Plus className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </div>
    </form>
  )

  // Modal controlado externamente
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-black/10">
            <h2 className="text-lg font-semibold">Registrar Interação</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {formContent}
        </div>
      </div>
    )
  }

  // Dialog normal
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-black/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Interação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Interação</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
