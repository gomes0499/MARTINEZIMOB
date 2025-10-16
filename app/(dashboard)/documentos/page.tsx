import { DocumentosManager } from "@/components/documentos/documentos-manager";
import { getDocumentos } from "@/lib/actions/documentos";
import { getProprietarios } from "@/lib/actions/proprietarios";
import { getInquilinos } from "@/lib/actions/inquilinos";
import { getImoveis } from "@/lib/actions/imoveis";
import { getContratos } from "@/lib/actions/contratos";

export default async function DocumentosPage() {
  const [
    documentosResult,
    proprietariosResult,
    inquilinosResult,
    imoveisResult,
    contratosResult,
  ] = await Promise.all([
    getDocumentos(),
    getProprietarios(),
    getInquilinos(),
    getImoveis(),
    getContratos(),
  ]);

  const documentos = documentosResult.success
    ? documentosResult.data || []
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
      <DocumentosManager
        documentos={documentos}
        proprietarios={proprietarios}
        inquilinos={inquilinos}
        imoveis={imoveis}
        contratos={contratos}
      />
    </main>
  );
}
