"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { DocumentosGrid } from "./documentos-grid"
import { FileText, Home, Users, UserCircle, FileSignature } from "lucide-react"

interface DocumentosManagerProps {
  documentos: any[]
  proprietarios: any[]
  inquilinos: any[]
  imoveis: any[]
  contratos: any[]
}

export function DocumentosManager({
  documentos,
  proprietarios,
  inquilinos,
  imoveis,
  contratos,
}: DocumentosManagerProps) {
  const [activeTab, setActiveTab] = useState("todos")

  // Agrupar documentos por tipo de entidade
  const documentosPorTipo = useMemo(() => {
    return {
      proprietario: documentos.filter((d) => d.tipo_entidade === "proprietario"),
      inquilino: documentos.filter((d) => d.tipo_entidade === "inquilino"),
      imovel: documentos.filter((d) => d.tipo_entidade === "imovel"),
      contrato: documentos.filter((d) => d.tipo_entidade === "contrato"),
    }
  }, [documentos])

  // Calcular stats
  const stats = {
    total: documentos.length,
    proprietarios: documentosPorTipo.proprietario.length,
    inquilinos: documentosPorTipo.inquilino.length,
    imoveis: documentosPorTipo.imovel.length,
    contratos: documentosPorTipo.contrato.length,
    tamanhoTotal: documentos.reduce((acc, doc) => acc + (doc.tamanho_bytes || 0), 0),
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black/5 rounded-lg">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.proprietarios}</div>
                <p className="text-sm text-muted-foreground">Proprietários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.inquilinos}</div>
                <p className="text-sm text-muted-foreground">Inquilinos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.imoveis}</div>
                <p className="text-sm text-muted-foreground">Imóveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <FileSignature className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.contratos}</div>
                <p className="text-sm text-muted-foreground">Contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Documentos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 border-black/10">
          <TabsTrigger value="todos" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Todos ({stats.total})
          </TabsTrigger>
          <TabsTrigger
            value="proprietarios"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Proprietários ({stats.proprietarios})
          </TabsTrigger>
          <TabsTrigger value="inquilinos" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Inquilinos ({stats.inquilinos})
          </TabsTrigger>
          <TabsTrigger value="imoveis" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Imóveis ({stats.imoveis})
          </TabsTrigger>
          <TabsTrigger value="contratos" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Contratos ({stats.contratos})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <DocumentosGrid
            documentos={documentos}
            entidades={{
              proprietarios,
              inquilinos,
              imoveis,
              contratos,
            }}
          />
        </TabsContent>

        <TabsContent value="proprietarios" className="space-y-4">
          <DocumentosGrid
            documentos={documentosPorTipo.proprietario}
            tipoEntidade="proprietario"
            entidades={{
              proprietarios,
              inquilinos,
              imoveis,
              contratos,
            }}
          />
        </TabsContent>

        <TabsContent value="inquilinos" className="space-y-4">
          <DocumentosGrid
            documentos={documentosPorTipo.inquilino}
            tipoEntidade="inquilino"
            entidades={{
              proprietarios,
              inquilinos,
              imoveis,
              contratos,
            }}
          />
        </TabsContent>

        <TabsContent value="imoveis" className="space-y-4">
          <DocumentosGrid
            documentos={documentosPorTipo.imovel}
            tipoEntidade="imovel"
            entidades={{
              proprietarios,
              inquilinos,
              imoveis,
              contratos,
            }}
          />
        </TabsContent>

        <TabsContent value="contratos" className="space-y-4">
          <DocumentosGrid
            documentos={documentosPorTipo.contrato}
            tipoEntidade="contrato"
            entidades={{
              proprietarios,
              inquilinos,
              imoveis,
              contratos,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
