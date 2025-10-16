import { ImoveisDataTable } from "@/components/imoveis/imoveis-data-table"
import { getImoveis } from "@/lib/actions/imoveis"
import { getProprietarios } from "@/lib/actions/proprietarios"

export default async function ImoveisPage() {
  const [imoveisResult, proprietariosResult] = await Promise.all([getImoveis(), getProprietarios()])

  const imoveis = imoveisResult.success ? imoveisResult.data || [] : []
  const proprietarios = proprietariosResult.success ? proprietariosResult.data || [] : []

  return <ImoveisDataTable initialImoveis={imoveis} proprietarios={proprietarios} />
}
