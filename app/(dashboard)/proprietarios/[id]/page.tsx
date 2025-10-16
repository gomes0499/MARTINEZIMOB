import { notFound } from "next/navigation"
import { getProprietarioById } from "@/lib/actions/proprietarios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Building2, FileText, MessageSquare, Pencil } from "lucide-react"
import Link from "next/link"

export default async function ProprietarioDetalhesPage({ params }: { params: { id: string } }) {
  const result = await getProprietarioById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const { proprietario, imoveis, documentos, interacoes } = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proprietarios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{proprietario.nome}</h1>
            <p className="text-muted-foreground">
              {proprietario.tipo_pessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={proprietario.ativo ? "default" : "secondary"}>
            {proprietario.ativo ? "Ativo" : "Inativo"}
          </Badge>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{proprietario.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{proprietario.telefone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Celular</p>
              <p className="font-medium">{proprietario.celular}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-muted-foreground">{proprietario.tipo_pessoa === "fisica" ? "CPF" : "CNPJ"}</p>
              <p className="font-medium">{proprietario.cpf_cnpj}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Imóveis</span>
              <span className="font-bold">{imoveis.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Documentos</span>
              <span className="font-bold">{documentos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Interações</span>
              <span className="font-bold">{interacoes.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="detalhes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="imoveis">Imóveis ({imoveis.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({documentos.length})</TabsTrigger>
          <TabsTrigger value="interacoes">Interações ({interacoes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-black/10">
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  {proprietario.endereco_logradouro}, {proprietario.endereco_numero}
                  {proprietario.endereco_complemento && ` - ${proprietario.endereco_complemento}`}
                </p>
                <p>
                  {proprietario.endereco_bairro} - {proprietario.endereco_cidade}/{proprietario.endereco_estado}
                </p>
                <p className="text-sm text-muted-foreground">CEP: {proprietario.endereco_cep}</p>
              </CardContent>
            </Card>

            <Card className="border-black/10">
              <CardHeader>
                <CardTitle>Dados Bancários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {proprietario.banco ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Banco</p>
                      <p className="font-medium">{proprietario.banco}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Agência</p>
                        <p className="font-medium">{proprietario.agencia}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conta</p>
                        <p className="font-medium">{proprietario.conta}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Conta</p>
                      <p className="font-medium">{proprietario.tipo_conta}</p>
                    </div>
                    {proprietario.pix && (
                      <div>
                        <p className="text-sm text-muted-foreground">PIX</p>
                        <p className="font-medium">{proprietario.pix}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum dado bancário cadastrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {proprietario.observacoes && (
            <Card className="border-black/10">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{proprietario.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="imoveis" className="space-y-4">
          {imoveis.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {imoveis.map((imovel: any) => (
                <Card key={imovel.id} className="border-black/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {imovel.tipo}
                    </CardTitle>
                    <CardDescription>
                      {imovel.endereco_logradouro}, {imovel.endereco_numero}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={imovel.status === "disponivel" ? "default" : "secondary"}>
                          {imovel.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor</span>
                        <span className="font-bold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(imovel.valor_aluguel)}
                        </span>
                      </div>
                      <Link href={`/imoveis/${imovel.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-black/10">
              <CardContent className="py-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum imóvel cadastrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          {documentos.length > 0 ? (
            <div className="grid gap-4">
              {documentos.map((doc: any) => (
                <Card key={doc.id} className="border-black/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <CardTitle className="text-base">{doc.nome}</CardTitle>
                      </div>
                      <Badge>{doc.tipo}</Badge>
                    </div>
                    <CardDescription>{doc.categoria}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          Visualizar
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-black/10">
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum documento cadastrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interacoes" className="space-y-4">
          {interacoes.length > 0 ? (
            <div className="space-y-4">
              {interacoes.map((interacao: any) => (
                <Card key={interacao.id} className="border-black/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <CardTitle className="text-base">{interacao.tipo}</CardTitle>
                      </div>
                      <Badge variant="outline">{new Date(interacao.data_hora).toLocaleDateString("pt-BR")}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{interacao.descricao}</p>
                    {interacao.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2">{interacao.observacoes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-black/10">
              <CardContent className="py-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma interação registrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
