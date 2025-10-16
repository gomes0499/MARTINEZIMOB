import { ContratoWizard } from "@/components/contratos/contrato-wizard";
import { getImoveis } from "@/lib/actions/imoveis";
import { getInquilinos } from "@/lib/actions/inquilinos";
import { getContratos } from "@/lib/actions/contratos";

export default async function NovoContratoPage() {
  const [imoveisResult, inquilinosResult, contratosResult] = await Promise.all([
    getImoveis(),
    getInquilinos(),
    getContratos(),
  ]);

  const imoveis = imoveisResult.success ? imoveisResult.data || [] : [];
  const todosInquilinos = inquilinosResult.success ? inquilinosResult.data || [] : [];
  const contratos = contratosResult.success ? contratosResult.data || [] : [];

  // Filtrar apenas imóveis disponíveis
  const imoveisDisponiveis = imoveis.filter((imovel: any) => imovel.status === "disponivel");

  // Filtrar inquilinos que não estão em contratos ativos
  const contratosAtivos = contratos.filter((c: any) => c.status === "ativo");
  const inquilinosEmContrato = new Set(
    contratosAtivos.map((c: any) => c.inquilino_principal_id)
  );
  const inquilinosDisponiveis = todosInquilinos.filter(
    (inq: any) => !inquilinosEmContrato.has(inq.id)
  );

  return (
    <div className="">
      <ContratoWizard
        imoveis={imoveisDisponiveis}
        inquilinos={inquilinosDisponiveis}
      />
    </div>
  );
}
