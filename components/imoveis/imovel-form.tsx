"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatarCEP } from "@/lib/validations"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createImovel, updateImovel } from "@/lib/actions/imoveis"
import { useRouter } from "next/navigation"

interface ImovelFormProps {
  onClose?: () => void
  initialData?: any
  proprietarios: Array<{ id: string; nome: string }>
}

export function ImovelForm({ onClose, initialData, proprietarios }: ImovelFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    proprietario_id: initialData?.proprietario_id || "",
    tipo: initialData?.tipo || "",
    endereco_cep: initialData?.endereco_cep || "",
    endereco_logradouro: initialData?.endereco_logradouro || "",
    endereco_numero: initialData?.endereco_numero || "",
    endereco_complemento: initialData?.endereco_complemento || "",
    endereco_bairro: initialData?.endereco_bairro || "",
    endereco_cidade: initialData?.endereco_cidade || "",
    endereco_estado: initialData?.endereco_estado || "",
    area_total: initialData?.area_total || "",
    area_construida: initialData?.area_construida || "",
    quartos: initialData?.quartos || "",
    banheiros: initialData?.banheiros || "",
    vagas_garagem: initialData?.vagas_garagem || "",
    valor_aluguel: initialData?.valor_aluguel || "",
    valor_condominio: initialData?.valor_condominio || "",
    iptu_anual: initialData?.iptu_anual || "",
    iptu_mensal: initialData?.iptu_mensal || "",
    conta_agua: initialData?.conta_agua || "",
    conta_luz: initialData?.conta_luz || "",
    conta_gas: initialData?.conta_gas || "",
    status: initialData?.status || "disponivel",
    descricao: initialData?.descricao || "",
    observacoes: initialData?.observacoes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const newErrors: Record<string, string> = {}

    if (!formData.proprietario_id) newErrors.proprietario_id = "Proprietário é obrigatório"
    if (!formData.tipo) newErrors.tipo = "Tipo de imóvel é obrigatório"
    if (!formData.endereco_cep) newErrors.endereco_cep = "CEP é obrigatório"
    if (!formData.endereco_logradouro) newErrors.endereco_logradouro = "Logradouro é obrigatório"
    if (!formData.endereco_numero) newErrors.endereco_numero = "Número é obrigatório"
    if (!formData.endereco_bairro) newErrors.endereco_bairro = "Bairro é obrigatório"
    if (!formData.endereco_cidade) newErrors.endereco_cidade = "Cidade é obrigatória"
    if (!formData.endereco_estado) newErrors.endereco_estado = "Estado é obrigatório"
    if (!formData.valor_aluguel) newErrors.valor_aluguel = "Valor do aluguel é obrigatório"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const result = initialData ? await updateImovel(initialData.id, formData) : await createImovel(formData)

      if (result.success) {
        toast({
          title: "Sucesso",
          description: initialData ? "Imóvel atualizado com sucesso" : "Imóvel cadastrado com sucesso",
        })
        if (onClose) {
          onClose()
        } else {
          router.push("/imoveis")
        }
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao salvar imóvel",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar imóvel",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
            {/* Proprietário e Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proprietario">Proprietário *</Label>
                <Select
                  value={formData.proprietario_id}
                  onValueChange={(value) => handleChange("proprietario_id", value)}
                >
                  <SelectTrigger className={errors.proprietario_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    {proprietarios.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.proprietario_id && <p className="text-sm text-red-500">{errors.proprietario_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Imóvel *</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                  <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartamento">Apartamento</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Sobrado">Sobrado</SelectItem>
                    <SelectItem value="Kitnet">Kitnet</SelectItem>
                    <SelectItem value="Loft">Loft</SelectItem>
                    <SelectItem value="Cobertura">Cobertura</SelectItem>
                    <SelectItem value="Sala Comercial">Sala Comercial</SelectItem>
                    <SelectItem value="Loja">Loja</SelectItem>
                    <SelectItem value="Galpão">Galpão</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && <p className="text-sm text-red-500">{errors.tipo}</p>}
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={formData.endereco_cep}
                    onChange={(e) => handleChange("endereco_cep", formatarCEP(e.target.value))}
                    placeholder="00000-000"
                    className={errors.endereco_cep ? "border-red-500" : ""}
                  />
                  {errors.endereco_cep && <p className="text-sm text-red-500">{errors.endereco_cep}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro *</Label>
                  <Input
                    id="logradouro"
                    value={formData.endereco_logradouro}
                    onChange={(e) => handleChange("endereco_logradouro", e.target.value)}
                    className={errors.endereco_logradouro ? "border-red-500" : ""}
                  />
                  {errors.endereco_logradouro && <p className="text-sm text-red-500">{errors.endereco_logradouro}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={formData.endereco_numero}
                    onChange={(e) => handleChange("endereco_numero", e.target.value)}
                    className={errors.endereco_numero ? "border-red-500" : ""}
                  />
                  {errors.endereco_numero && <p className="text-sm text-red-500">{errors.endereco_numero}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.endereco_complemento}
                    onChange={(e) => handleChange("endereco_complemento", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={formData.endereco_bairro}
                    onChange={(e) => handleChange("endereco_bairro", e.target.value)}
                    className={errors.endereco_bairro ? "border-red-500" : ""}
                  />
                  {errors.endereco_bairro && <p className="text-sm text-red-500">{errors.endereco_bairro}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.endereco_cidade}
                    onChange={(e) => handleChange("endereco_cidade", e.target.value)}
                    className={errors.endereco_cidade ? "border-red-500" : ""}
                  />
                  {errors.endereco_cidade && <p className="text-sm text-red-500">{errors.endereco_cidade}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={formData.endereco_estado}
                    onChange={(e) => handleChange("endereco_estado", e.target.value.toUpperCase())}
                    maxLength={2}
                    placeholder="SP"
                    className={errors.endereco_estado ? "border-red-500" : ""}
                  />
                  {errors.endereco_estado && <p className="text-sm text-red-500">{errors.endereco_estado}</p>}
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Características</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area_total">Área Total (m²)</Label>
                  <Input
                    id="area_total"
                    type="number"
                    step="0.01"
                    value={formData.area_total}
                    onChange={(e) => handleChange("area_total", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area_construida">Área Construída (m²)</Label>
                  <Input
                    id="area_construida"
                    type="number"
                    step="0.01"
                    value={formData.area_construida}
                    onChange={(e) => handleChange("area_construida", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quartos">Quartos</Label>
                  <Input
                    id="quartos"
                    type="number"
                    value={formData.quartos}
                    onChange={(e) => handleChange("quartos", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banheiros">Banheiros</Label>
                  <Input
                    id="banheiros"
                    type="number"
                    value={formData.banheiros}
                    onChange={(e) => handleChange("banheiros", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vagas_garagem">Vagas Garagem</Label>
                  <Input
                    id="vagas_garagem"
                    type="number"
                    value={formData.vagas_garagem}
                    onChange={(e) => handleChange("vagas_garagem", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Valores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_aluguel">Valor do Aluguel *</Label>
                  <Input
                    id="valor_aluguel"
                    type="number"
                    step="0.01"
                    value={formData.valor_aluguel}
                    onChange={(e) => handleChange("valor_aluguel", e.target.value)}
                    placeholder="0.00"
                    className={errors.valor_aluguel ? "border-red-500" : ""}
                  />
                  {errors.valor_aluguel && <p className="text-sm text-red-500">{errors.valor_aluguel}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_condominio">Valor do Condomínio</Label>
                  <Input
                    id="valor_condominio"
                    type="number"
                    step="0.01"
                    value={formData.valor_condominio}
                    onChange={(e) => handleChange("valor_condominio", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iptu_anual">IPTU Anual</Label>
                  <Input
                    id="iptu_anual"
                    type="number"
                    step="0.01"
                    value={formData.iptu_anual}
                    onChange={(e) => handleChange("iptu_anual", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iptu_mensal">IPTU Mensal</Label>
                  <Input
                    id="iptu_mensal"
                    type="number"
                    step="0.01"
                    value={formData.iptu_mensal}
                    onChange={(e) => handleChange("iptu_mensal", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Contas de Consumo */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contas de Consumo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conta_agua">Conta de Água</Label>
                  <Input
                    id="conta_agua"
                    value={formData.conta_agua}
                    onChange={(e) => handleChange("conta_agua", e.target.value)}
                    placeholder="Número da instalação"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conta_luz">Conta de Luz</Label>
                  <Input
                    id="conta_luz"
                    value={formData.conta_luz}
                    onChange={(e) => handleChange("conta_luz", e.target.value)}
                    placeholder="Número da instalação"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conta_gas">Conta de Gás</Label>
                  <Input
                    id="conta_gas"
                    value={formData.conta_gas}
                    onChange={(e) => handleChange("conta_gas", e.target.value)}
                    placeholder="Número da instalação"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="locado">Locado</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição e Observações */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  rows={3}
                  placeholder="Descrição detalhada do imóvel..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose ? onClose : () => router.push("/imoveis")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : initialData ? "Salvar Alterações" : "Cadastrar Imóvel"}
              </Button>
            </div>
          </form>
  )

  // Se tiver onClose, renderiza no modal, senão renderiza direto
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{initialData ? "Editar Imóvel" : "Novo Imóvel"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {formContent}
          </CardContent>
        </Card>
      </div>
    )
  }

  return formContent
}
