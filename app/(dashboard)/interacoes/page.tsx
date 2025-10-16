import { InteracoesManager } from "@/components/interacoes/interacoes-manager";
import { getInteracoes } from "@/lib/actions/interacoes";
import { getProprietarios } from "@/lib/actions/proprietarios";
import { getInquilinos } from "@/lib/actions/inquilinos";
import { getImoveis } from "@/lib/actions/imoveis";
import { getContratos } from "@/lib/actions/contratos";

export default async function InteracoesPage() {
  const [
    interacoesResult,
    proprietariosResult,
    inquilinosResult,
    imoveisResult,
    contratosResult,
  ] = await Promise.all([
    getInteracoes(),
    getProprietarios(),
    getInquilinos(),
    getImoveis(),
    getContratos(),
  ]);

  const interacoes = interacoesResult.success
    ? interacoesResult.data || []
    : [];
  const proprietarios = proprietariosResult.success
    ? proprietariosResult.data || []
    : [];
  const inquilinos = inquilinosResult.success
    ? inquilinosResult.data || []
    : [];
  const imoveis = imoveisResult.success ? imoveisResult.data || [] : [];
  const contratos = contratosResult.success ? contratosResult.data || [] : [];

  return (
    <main>
      <InteracoesManager
        interacoes={interacoes}
        proprietarios={proprietarios}
        inquilinos={inquilinos}
        imoveis={imoveis}
        contratos={contratos}
      />
    </main>
  );
}
