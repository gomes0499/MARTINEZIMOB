"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validarCPF, validarCNPJ, formatarCPF, formatarCNPJ, formatarTelefone, formatarCEP } from "@/lib/validations"
import { createProprietario, updateProprietario, type Proprietario } from "@/lib/actions/proprietarios"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface ProprietarioFormProps {
  onClose?: () => void
  initialData?: Proprietario | null
}

export function ProprietarioForm({ onClose, initialData }: ProprietarioFormProps) {
  const router = useRouter()
  const [tipoPessoa, setTipoPessoa] = useState<"fisica" | "juridica">(initialData?.tipo_pessoa || "fisica")
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    cpf_cnpj: initialData?.cpf_cnpj || "",
    email: initialData?.email || "",
    telefone: initialData?.telefone || "",
    celular: initialData?.celular || "",
    endereco_cep: initialData?.endereco_cep || "",
    endereco_logradouro: initialData?.endereco_logradouro || "",
    endereco_numero: initialData?.endereco_numero || "",
    endereco_complemento: initialData?.endereco_complemento || "",
    endereco_bairro: initialData?.endereco_bairro || "",
    endereco_cidade: initialData?.endereco_cidade || "",
    endereco_estado: initialData?.endereco_estado || "",
    banco: initialData?.banco || "",
    agencia: initialData?.agencia || "",
    conta: initialData?.conta || "",
    tipo_conta: initialData?.tipo_conta || "",
    pix: initialData?.pix || "",
    observacoes: initialData?.observacoes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Validações
    if (!formData.nome) newErrors.nome = "Nome é obrigatório"
    if (!formData.cpf_cnpj) {
      newErrors.cpf_cnpj = tipoPessoa === "fisica" ? "CPF é obrigatório" : "CNPJ é obrigatório"
    } else {
      const documento = formData.cpf_cnpj.replace(/[^\d]/g, "")
      if (tipoPessoa === "fisica" && !validarCPF(documento)) {
        newErrors.cpf_cnpj = "CPF inválido"
      } else if (tipoPessoa === "juridica" && !validarCNPJ(documento)) {
        newErrors.cpf_cnpj = "CNPJ inválido"
      }
    }
    // Email e telefone agora são opcionais

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const data = { ...formData, tipo_pessoa: tipoPessoa, ativo: true }

      const result = initialData ? await updateProprietario(initialData.id, data) : await createProprietario(data)

      if (result.success) {
        toast({
          title: "Sucesso",
          description: initialData ? "Proprietário atualizado com sucesso" : "Proprietário cadastrado com sucesso",
        })
        if (onClose) {
          onClose()
        } else {
          router.push("/proprietarios")
        }
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao salvar proprietário",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar proprietário",
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
            {/* Tipo de Pessoa */}
            <div className="space-y-2">
              <Label>Tipo de Pessoa</Label>
              <Select value={tipoPessoa} onValueChange={(value: "fisica" | "juridica") => setTipoPessoa(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo / Razão Social *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  className={errors.nome ? "border-red-500" : ""}
                />
                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">{tipoPessoa === "fisica" ? "CPF" : "CNPJ"} *</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => {
                    const formatted =
                      tipoPessoa === "fisica" ? formatarCPF(e.target.value) : formatarCNPJ(e.target.value)
                    handleChange("cpf_cnpj", formatted)
                  }}
                  placeholder={tipoPessoa === "fisica" ? "000.000.000-00" : "00.000.000/0000-00"}
                  className={errors.cpf_cnpj ? "border-red-500" : ""}
                />
                {errors.cpf_cnpj && <p className="text-sm text-red-500">{errors.cpf_cnpj}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleChange("telefone", formatarTelefone(e.target.value))}
                  placeholder="(00) 0000-0000"
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && <p className="text-sm text-red-500">{errors.telefone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => handleChange("celular", formatarTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.endereco_cep}
                    onChange={(e) => handleChange("endereco_cep", formatarCEP(e.target.value))}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formData.endereco_logradouro}
                    onChange={(e) => handleChange("endereco_logradouro", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.endereco_numero}
                    onChange={(e) => handleChange("endereco_numero", e.target.value)}
                  />
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
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.endereco_bairro}
                    onChange={(e) => handleChange("endereco_bairro", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.endereco_cidade}
                    onChange={(e) => handleChange("endereco_cidade", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.endereco_estado}
                    onChange={(e) => handleChange("endereco_estado", e.target.value.toUpperCase())}
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dados Bancários</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Input id="banco" value={formData.banco} onChange={(e) => handleChange("banco", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    value={formData.agencia}
                    onChange={(e) => handleChange("agencia", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input id="conta" value={formData.conta} onChange={(e) => handleChange("conta", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_conta">Tipo de Conta</Label>
                  <Select value={formData.tipo_conta} onValueChange={(value) => handleChange("tipo_conta", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                      <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pix">Chave PIX</Label>
                  <Input
                    id="pix"
                    value={formData.pix}
                    onChange={(e) => handleChange("pix", e.target.value)}
                    placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                rows={4}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : initialData ? "Salvar Alterações" : "Cadastrar Proprietário"}
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
            <CardTitle>{initialData ? "Editar Proprietário" : "Novo Proprietário"}</CardTitle>
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
