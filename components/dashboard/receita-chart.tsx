"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface ReceitaChartProps {
  data: Array<{ mes: string; valor: number }>
}

export function ReceitaChart({ data }: ReceitaChartProps) {
  return (
    <Card className="border-black/10">
      <CardHeader>
        <CardTitle>Receita Mensal da Imobiliária</CardTitle>
        <CardDescription>
          Taxa de administração (10% dos aluguéis recebidos) - Últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            valor: {
              label: "Receita",
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
