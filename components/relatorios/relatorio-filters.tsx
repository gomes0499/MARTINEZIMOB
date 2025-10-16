"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"

interface RelatorioFiltersProps {
  periodoInicio: string
  periodoFim: string
  onPeriodoInicioChange: (value: string) => void
  onPeriodoFimChange: (value: string) => void
}

export function RelatorioFilters({
  periodoInicio,
  periodoFim,
  onPeriodoInicioChange,
  onPeriodoFimChange,
}: RelatorioFiltersProps) {
  const hoje = new Date().toISOString().split("T")[0]
  const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0]

  const setPeriodoPreset = (tipo: string) => {
    const hoje = new Date()
    let inicio = new Date()
    let fim = new Date()

    switch (tipo) {
      case "mes-atual":
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
        break
      case "mes-anterior":
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
        break
      case "trimestre":
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)
        fim = new Date()
        break
      case "ano":
        inicio = new Date(hoje.getFullYear(), 0, 1)
        fim = new Date()
        break
    }

    onPeriodoInicioChange(inicio.toISOString().split("T")[0])
    onPeriodoFimChange(fim.toISOString().split("T")[0])
  }

  return (
    <Card className="border-black/10">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Período do Relatório</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo-inicio">Data Início</Label>
              <Input
                id="periodo-inicio"
                type="date"
                value={periodoInicio}
                onChange={(e) => onPeriodoInicioChange(e.target.value)}
                className="focus-visible:ring-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo-fim">Data Fim</Label>
              <Input
                id="periodo-fim"
                type="date"
                value={periodoFim}
                onChange={(e) => onPeriodoFimChange(e.target.value)}
                className="focus-visible:ring-black"
                min={periodoInicio}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Períodos rápidos:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPeriodoPreset("mes-atual")}
              className="border-black/10"
            >
              Mês Atual
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPeriodoPreset("mes-anterior")}
              className="border-black/10"
            >
              Mês Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPeriodoPreset("trimestre")}
              className="border-black/10"
            >
              Último Trimestre
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPeriodoPreset("ano")}
              className="border-black/10"
            >
              Ano Atual
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
