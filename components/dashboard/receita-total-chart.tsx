"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface ReceitaTotalChartProps {
  data: Array<{ mes: string; valor: number }>
}

export function ReceitaTotalChart({ data }: ReceitaTotalChartProps) {
  return (
    <Card className="border-black/10">
      <CardHeader>
        <CardTitle>Receita Total de Aluguéis</CardTitle>
        <CardDescription>
          Valor total dos aluguéis recebidos (100%) - Últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            valor: {
              label: "Receita Total",
              color: "hsl(0 0% 0%)",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="mes"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  notation: "compact",
                }).format(value)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value as number)
                  }
                />
              }
            />
            <Bar dataKey="valor" fill="hsl(0 0% 0%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
