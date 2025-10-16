import { ContratosTable } from "@/components/contratos/contratos-table";
import { getContratos } from "@/lib/actions/contratos";
import { getImoveis } from "@/lib/actions/imoveis";
import { getInquilinos } from "@/lib/actions/inquilinos";

export default async function ContratosPage() {
  const [contratosResult, imoveisResult, inquilinosResult] = await Promise.all([
    getContratos(),
    getImoveis(),
    getInquilinos(),
  ]);

  const contratos = contratosResult.success ? contratosResult.data || [] : [];
  const imoveis = imoveisResult.success ? imoveisResult.data || [] : [];
  const inquilinos = inquilinosResult.success
    ? inquilinosResult.data || []
    : [];

  return (
    <main>
      <ContratosTable
        initialContratos={contratos}
        imoveis={imoveis}
        inquilinos={inquilinos}
      />
    </main>
  );
}
