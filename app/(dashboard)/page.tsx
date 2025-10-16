import {
  getDashboardStats,
  getPagamentosPendentes,
  getContratosRecentes,
  getReceitaMensal,
  getReceitaTotalMensal,
} from "@/lib/actions/dashboard";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const [statsResult, pagamentosResult, contratosResult, receitaResult, receitaTotalResult] =
    await Promise.all([
      getDashboardStats(),
      getPagamentosPendentes(),
      getContratosRecentes(),
      getReceitaMensal(),
      getReceitaTotalMensal(),
    ]);

  const defaultStats = {
    imoveis: { total: 0, disponiveis: 0, locados: 0, manutencao: 0 },
    contratos: { ativos: 0, vencendo: 0, vencidos: 0 },
    financeiro: {
      receitaMensal: 0,
      receitaTotal: 0,
      recebido: 0,
      recebidoTotal: 0,
      pendente: 0,
      pendenteTotal: 0,
      atrasado: 0,
      atrasadoTotal: 0,
      crescimento: 0,
    },
    cadastros: { proprietarios: 0, inquilinos: 0 },
  };

  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : defaultStats;

  const pagamentosPendentes = pagamentosResult.success
    ? pagamentosResult.data || []
    : [];
  const contratosRecentes = contratosResult.success ? contratosResult.data || [] : [];
  const receitaMensal = receitaResult.success ? receitaResult.data || [] : [];
  const receitaTotal = receitaTotalResult.success ? receitaTotalResult.data || [] : [];

  return (
    <DashboardContent
      stats={stats}
      pagamentosPendentes={pagamentosPendentes}
      contratosRecentes={contratosRecentes}
      receitaMensal={receitaMensal}
      receitaTotal={receitaTotal}
    />
  );
}
