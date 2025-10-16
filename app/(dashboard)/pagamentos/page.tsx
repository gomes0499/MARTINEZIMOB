import { PagamentosTable } from "@/components/pagamentos/pagamentos-table";
import {
  getPagamentos,
  gerarPagamentosTodosContratos,
} from "@/lib/actions/pagamentos";

export default async function PagamentosPage() {
  let result = await getPagamentos();
  let pagamentos = result.success ? result.data || [] : [];

  // Se não houver pagamentos, gerar automaticamente para todos os contratos ativos
  if (pagamentos.length === 0) {
    const gerarResult = await gerarPagamentosTodosContratos();
    if (gerarResult.success) {
      // Buscar novamente após gerar
      result = await getPagamentos();
      pagamentos = result.success ? result.data || [] : [];
    }
  }

  return (
    <main>
      <PagamentosTable initialPagamentos={pagamentos} />
    </main>
  );
}
