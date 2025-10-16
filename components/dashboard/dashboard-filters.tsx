"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface DashboardFiltersProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
}

export function DashboardFilters({ selectedPeriod, onPeriodChange }: DashboardFiltersProps) {
  const periods = [
    { value: "mes-atual", label: "Mês Atual" },
    { value: "30-dias", label: "Últimos 30 dias" },
    { value: "60-dias", label: "Últimos 60 dias" },
    { value: "90-dias", label: "Últimos 90 dias" },
    { value: "semestre", label: "Último Semestre" },
    { value: "ano", label: "Último Ano" },
  ]

  return (
    <div className="flex items-center gap-2 mb-6">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">Período:</span>
      <div className="flex gap-2">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(period.value)}
            className={
              selectedPeriod === period.value
                ? "bg-black hover:bg-black/90"
                : "border-black/10"
            }
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
