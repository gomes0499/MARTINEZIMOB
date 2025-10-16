"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface PagamentoModalProps {
  onClose: () => void
  onSave: (data: any) => void
  pagamento: any
}

export function PagamentoModal({ onClose, onSave, pagamento }: PagamentoModalProps) {
  const [formData, setFormData] = useState({
    data_pagamento: pagamento.data_pagamento || "",
    valor_pago: pagamento.valor_pago || pagamento.valor_total || "",
    forma_pagamento: pagamento.forma_pagamento || "",
    observacoes: pagamento.observacoes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.data_pagamento) newErrors.data_pagamento = "Data de pagamento é obrigatória"
    if (!formData.valor_pago) newErrors.valor_pago = "Valor pago é obrigatório"
    if (!formData.forma_pagamento) newErrors.forma_pagamento = "Forma de pagamento é obrigatória"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({ ...pagamento, ...formData, status: "pago" })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registrar Pagamento</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações do Pagamento */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contrato</p>
                    <p className="font-medium">{pagamento.contrato_info}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium">{pagamento.tipo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mês Referência</p>
                    <p className="font-medium">
                      {new Date(pagamento.mes_referencia).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className="font-medium">{new Date(pagamento.data_vencimento).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Original</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        pagamento.valor_original,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Total (com encargos)</p>
                    <p className="font-medium text-lg">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        pagamento.valor_total,
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
                <Input
                  id="data_pagamento"
                  type="date"
                  value={formData.data_pagamento}
                  onChange={(e) => handleChange("data_pagamento", e.target.value)}
                  className={errors.data_pagamento ? "border-red-500" : ""}
                />
                {errors.data_pagamento && <p className="text-sm text-red-500">{errors.data_pagamento}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_pago">Valor Pago *</Label>
                <Input
                  id="valor_pago"
                  type="number"
                  step="0.01"
                  value={formData.valor_pago}
                  onChange={(e) => handleChange("valor_pago", e.target.value)}
                  className={errors.valor_pago ? "border-red-500" : ""}
                />
                {errors.valor_pago && <p className="text-sm text-red-500">{errors.valor_pago}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(value) => handleChange("forma_pagamento", value)}
              >
                <SelectTrigger className={errors.forma_pagamento ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
              {errors.forma_pagamento && <p className="text-sm text-red-500">{errors.forma_pagamento}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                rows={3}
                placeholder="Informações adicionais sobre o pagamento..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Confirmar Pagamento</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
