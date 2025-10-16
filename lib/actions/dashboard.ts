"use server"

import { sql } from "@/lib/db"

type Period = "mes-atual" | "30-dias" | "60-dias" | "90-dias" | "semestre" | "ano"

function getDateFilter(period: Period) {
  const today = new Date()

  switch (period) {
    case "mes-atual":
      return {
        sql: `EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)`,
        interval: "1 month"
      }
    case "30-dias":
      return {
        sql: `data_vencimento >= CURRENT_DATE - INTERVAL '30 days'`,
        interval: "30 days"
      }
    case "60-dias":
      return {
        sql: `data_vencimento >= CURRENT_DATE - INTERVAL '60 days'`,
        interval: "60 days"
      }
    case "90-dias":
      return {
        sql: `data_vencimento >= CURRENT_DATE - INTERVAL '90 days'`,
        interval: "90 days"
      }
    case "semestre":
      return {
        sql: `data_vencimento >= CURRENT_DATE - INTERVAL '6 months'`,
        interval: "6 months"
      }
    case "ano":
      return {
        sql: `data_vencimento >= CURRENT_DATE - INTERVAL '12 months'`,
        interval: "12 months"
      }
    default:
      return {
        sql: `EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)`,
        interval: "1 month"
      }
  }
}

export async function getDashboardStats(period: Period = "mes-atual") {
  try {
    // Buscar estatísticas de imóveis
    const imoveisStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'disponivel') as disponiveis,
        COUNT(*) FILTER (WHERE status = 'locado') as locados,
        COUNT(*) FILTER (WHERE status = 'manutencao') as manutencao
      FROM imoveis
    `

    // Buscar estatísticas de contratos
    const contratosStats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'ativo') as ativos,
        COUNT(*) FILTER (WHERE status = 'ativo' AND data_fim <= CURRENT_DATE + INTERVAL '30 days') as vencendo,
        COUNT(*) FILTER (WHERE status = 'vencido') as vencidos
      FROM contratos
    `

    // Buscar estatísticas financeiras do mês atual
    // Receita da imobiliária = 10% do valor dos aluguéis
    // Receita total = 100% do valor dos aluguéis
    const financeiroStats = await sql`
      SELECT
        COALESCE(SUM(valor_original * 0.10), 0) as receita_mensal,
        COALESCE(SUM(valor_original), 0) as receita_total,
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as recebido,
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as recebido_total,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original * 0.10 ELSE 0 END), 0) as pendente,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original ELSE 0 END), 0) as pendente_total,
        COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original * 0.10 ELSE 0 END), 0) as atrasado,
        COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original ELSE 0 END), 0) as atrasado_total
      FROM pagamentos
      WHERE EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND tipo = 'aluguel'
    `

    // Buscar estatísticas de cadastros
    const cadastrosStats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM proprietarios) as proprietarios,
        (SELECT COUNT(*) FROM inquilinos) as inquilinos
    `

    // Calcular crescimento (comparar com mês anterior)
    // 10% dos aluguéis pagos
    const mesAnterior = await sql`
      SELECT COALESCE(SUM(valor_original * 0.10), 0) as receita_mes_anterior
      FROM pagamentos
      WHERE EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
        AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
        AND status = 'pago'
        AND tipo = 'aluguel'
    `

    const receitaAtual = Number(financeiroStats[0].recebido)
    const receitaAnterior = Number(mesAnterior[0].receita_mes_anterior)
    const crescimento = receitaAnterior > 0 ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100 : 0

    return {
      success: true,
      data: {
        imoveis: {
          total: Number(imoveisStats[0].total),
          disponiveis: Number(imoveisStats[0].disponiveis),
          locados: Number(imoveisStats[0].locados),
          manutencao: Number(imoveisStats[0].manutencao),
        },
        contratos: {
          ativos: Number(contratosStats[0].ativos),
          vencendo: Number(contratosStats[0].vencendo),
          vencidos: Number(contratosStats[0].vencidos),
        },
        financeiro: {
          receitaMensal: Number(financeiroStats[0].receita_mensal),
          receitaTotal: Number(financeiroStats[0].receita_total),
          recebido: Number(financeiroStats[0].recebido),
          recebidoTotal: Number(financeiroStats[0].recebido_total),
          pendente: Number(financeiroStats[0].pendente),
          pendenteTotal: Number(financeiroStats[0].pendente_total),
          atrasado: Number(financeiroStats[0].atrasado),
          atrasadoTotal: Number(financeiroStats[0].atrasado_total),
          crescimento: Number(crescimento.toFixed(1)),
        },
        cadastros: {
          proprietarios: Number(cadastrosStats[0].proprietarios),
          inquilinos: Number(cadastrosStats[0].inquilinos),
        },
      },
    }
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return { success: false, error: "Erro ao buscar estatísticas" }
  }
}

export async function getPagamentosPendentes() {
  try {
    const pagamentos = await sql`
      SELECT
        p.id,
        i.endereco_logradouro || ', ' || i.endereco_numero as contrato,
        inq.nome as inquilino,
        p.tipo,
        p.valor_original as valor,
        p.data_vencimento as vencimento,
        CASE
          WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
          ELSE 0
        END as dias_atraso
      FROM pagamentos p
      JOIN contratos c ON p.contrato_id = c.id
      JOIN imoveis i ON c.imovel_id = i.id
      JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
      WHERE p.status IN ('pendente', 'atrasado')
        AND EXTRACT(MONTH FROM p.data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM p.data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
      ORDER BY p.data_vencimento ASC
      LIMIT 5
    `

    return {
      success: true,
      data: pagamentos.map((p) => ({
        id: p.id,
        contrato: p.contrato,
        inquilino: p.inquilino,
        tipo: p.tipo,
        valor: Number(p.valor),
        vencimento: p.vencimento,
        diasAtraso: Number(p.dias_atraso),
      })),
    }
  } catch (error) {
    console.error("[v0] Error fetching pagamentos pendentes:", error)
    return { success: false, error: "Erro ao buscar pagamentos pendentes" }
  }
}

export async function getContratosRecentes() {
  try {
    const contratos = await sql`
      SELECT
        c.id,
        i.endereco_logradouro || ', ' || i.endereco_numero as imovel,
        inq.nome as inquilino,
        c.data_inicio,
        c.valor_aluguel as valor
      FROM contratos c
      JOIN imoveis i ON c.imovel_id = i.id
      JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
      WHERE c.status = 'ativo'
      ORDER BY c.data_inicio DESC
      LIMIT 5
    `

    return {
      success: true,
      data: contratos.map((c) => ({
        id: c.id,
        imovel: c.imovel,
        inquilino: c.inquilino,
        dataInicio: c.data_inicio,
        valor: Number(c.valor),
      })),
    }
  } catch (error) {
    console.error("[v0] Error fetching contratos recentes:", error)
    return { success: false, error: "Erro ao buscar contratos recentes" }
  }
}

export async function getReceitaMensal() {
  try {
    // Receita = 10% dos aluguéis pagos
    const receitas = await sql`
      SELECT
        TO_CHAR(data_vencimento, 'Mon') as mes,
        EXTRACT(MONTH FROM data_vencimento) as mes_numero,
        COALESCE(SUM(valor_original * 0.10), 0) as valor
      FROM pagamentos
      WHERE data_vencimento >= CURRENT_DATE - INTERVAL '6 months'
        AND status = 'pago'
        AND tipo = 'aluguel'
      GROUP BY TO_CHAR(data_vencimento, 'Mon'), EXTRACT(MONTH FROM data_vencimento)
      ORDER BY EXTRACT(MONTH FROM data_vencimento) ASC
    `

    return {
      success: true,
      data: receitas.map((r) => ({
        mes: r.mes,
        valor: Number(r.valor),
      })),
    }
  } catch (error) {
    console.error("[v0] Error fetching receita mensal:", error)
    return { success: false, error: "Erro ao buscar receita mensal" }
  }
}

export async function getReceitaTotalMensal() {
  try {
    // Receita total = 100% dos aluguéis pagos
    const receitas = await sql`
      SELECT
        TO_CHAR(data_vencimento, 'Mon') as mes,
        EXTRACT(MONTH FROM data_vencimento) as mes_numero,
        COALESCE(SUM(valor_original), 0) as valor
      FROM pagamentos
      WHERE data_vencimento >= CURRENT_DATE - INTERVAL '6 months'
        AND status = 'pago'
        AND tipo = 'aluguel'
      GROUP BY TO_CHAR(data_vencimento, 'Mon'), EXTRACT(MONTH FROM data_vencimento)
      ORDER BY EXTRACT(MONTH FROM data_vencimento) ASC
    `

    return {
      success: true,
      data: receitas.map((r) => ({
        mes: r.mes,
        valor: Number(r.valor),
      })),
    }
  } catch (error) {
    console.error("[v0] Error fetching receita total mensal:", error)
    return { success: false, error: "Erro ao buscar receita total mensal" }
  }
}

export async function getDashboardDataByPeriod(period: Period = "mes-atual") {
  try {
    console.log("[Dashboard] Fetching data for period:", period)
    let financeiroStats, pagamentos

    // Buscar estatísticas financeiras com o filtro de período
    if (period === "mes-atual") {
      financeiroStats = await sql`
        SELECT
          COALESCE(SUM(valor_original * 0.10), 0) as receita_mensal,
          COALESCE(SUM(valor_original), 0) as receita_total,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as recebido,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as recebido_total,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original * 0.10 ELSE 0 END), 0) as pendente,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original ELSE 0 END), 0) as pendente_total,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original * 0.10 ELSE 0 END), 0) as atrasado,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original ELSE 0 END), 0) as atrasado_total
        FROM pagamentos
        WHERE EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND tipo = 'aluguel'
      `

      pagamentos = await sql`
        SELECT
          p.id,
          i.endereco_logradouro || ', ' || i.endereco_numero as contrato,
          inq.nome as inquilino,
          p.tipo,
          p.valor_original as valor,
          p.data_vencimento as vencimento,
          CASE
            WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
            ELSE 0
          END as dias_atraso
        FROM pagamentos p
        JOIN contratos c ON p.contrato_id = c.id
        JOIN imoveis i ON c.imovel_id = i.id
        JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
        WHERE p.status IN ('pendente', 'atrasado')
          AND EXTRACT(MONTH FROM p.data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM p.data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
        ORDER BY p.data_vencimento ASC
        LIMIT 5
      `
    } else if (period === "30-dias") {
      financeiroStats = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as receita_mensal,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as receita_total,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as recebido,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as recebido_total,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original * 0.10 ELSE 0 END), 0) as pendente,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original ELSE 0 END), 0) as pendente_total,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original * 0.10 ELSE 0 END), 0) as atrasado,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original ELSE 0 END), 0) as atrasado_total
        FROM pagamentos
        WHERE data_vencimento >= CURRENT_DATE - INTERVAL '30 days'
          AND tipo = 'aluguel'
      `

      pagamentos = await sql`
        SELECT
          p.id,
          i.endereco_logradouro || ', ' || i.endereco_numero as contrato,
          inq.nome as inquilino,
          p.tipo,
          p.valor_original as valor,
          p.data_vencimento as vencimento,
          CASE
            WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
            ELSE 0
          END as dias_atraso
        FROM pagamentos p
        JOIN contratos c ON p.contrato_id = c.id
        JOIN imoveis i ON c.imovel_id = i.id
        JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
        WHERE p.status IN ('pendente', 'atrasado')
          AND p.data_vencimento >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY p.data_vencimento ASC
        LIMIT 5
      `
    } else if (period === "60-dias") {
      financeiroStats = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as receita_mensal,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as receita_total,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as recebido,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as recebido_total,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original * 0.10 ELSE 0 END), 0) as pendente,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original ELSE 0 END), 0) as pendente_total,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original * 0.10 ELSE 0 END), 0) as atrasado,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original ELSE 0 END), 0) as atrasado_total
        FROM pagamentos
        WHERE data_vencimento >= CURRENT_DATE - INTERVAL '60 days'
          AND tipo = 'aluguel'
      `

      pagamentos = await sql`
        SELECT
          p.id,
          i.endereco_logradouro || ', ' || i.endereco_numero as contrato,
          inq.nome as inquilino,
          p.tipo,
          p.valor_original as valor,
          p.data_vencimento as vencimento,
          CASE
            WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
            ELSE 0
          END as dias_atraso
        FROM pagamentos p
        JOIN contratos c ON p.contrato_id = c.id
        JOIN imoveis i ON c.imovel_id = i.id
        JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
        WHERE p.status IN ('pendente', 'atrasado')
          AND p.data_vencimento >= CURRENT_DATE - INTERVAL '60 days'
        ORDER BY p.data_vencimento ASC
        LIMIT 5
      `
    } else if (period === "90-dias") {
      financeiroStats = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as receita_mensal,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as receita_total,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as recebido,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as recebido_total,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original * 0.10 ELSE 0 END), 0) as pendente,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original ELSE 0 END), 0) as pendente_total,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original * 0.10 ELSE 0 END), 0) as atrasado,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original ELSE 0 END), 0) as atrasado_total
        FROM pagamentos
        WHERE data_vencimento >= CURRENT_DATE - INTERVAL '90 days'
          AND tipo = 'aluguel'
      `

      pagamentos = await sql`
        SELECT
          p.id,
          i.endereco_logradouro || ', ' || i.endereco_numero as contrato,
          inq.nome as inquilino,
          p.tipo,
          p.valor_original as valor,
          p.data_vencimento as vencimento,
          CASE
            WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
            ELSE 0
          END as dias_atraso
        FROM pagamentos p
        JOIN contratos c ON p.contrato_id = c.id
        JOIN imoveis i ON c.imovel_id = i.id
        JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
        WHERE p.status IN ('pendente', 'atrasado')
          AND p.data_vencimento >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY p.data_vencimento ASC
        LIMIT 5
      `
    } else if (period === "semestre") {
      financeiroStats = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as receita_mensal,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as receita_total,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as recebido,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as recebido_total,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original * 0.10 ELSE 0 END), 0) as pendente,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original ELSE 0 END), 0) as pendente_total,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original * 0.10 ELSE 0 END), 0) as atrasado,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original ELSE 0 END), 0) as atrasado_total
        FROM pagamentos
        WHERE data_vencimento >= CURRENT_DATE - INTERVAL '6 months'
          AND tipo = 'aluguel'
      `

      pagamentos = await sql`
        SELECT
          p.id,
          i.endereco_logradouro || ', ' || i.endereco_numero as contrato,
          inq.nome as inquilino,
          p.tipo,
          p.valor_original as valor,
          p.data_vencimento as vencimento,
          CASE
            WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
            ELSE 0
          END as dias_atraso
        FROM pagamentos p
        JOIN contratos c ON p.contrato_id = c.id
        JOIN imoveis i ON c.imovel_id = i.id
        JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
        WHERE p.status IN ('pendente', 'atrasado')
          AND p.data_vencimento >= CURRENT_DATE - INTERVAL '6 months'
        ORDER BY p.data_vencimento ASC
        LIMIT 5
      `
    } else { // ano
      financeiroStats = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as receita_mensal,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as receita_total,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original * 0.10 ELSE 0 END), 0) as recebido,
          COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_original ELSE 0 END), 0) as recebido_total,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original * 0.10 ELSE 0 END), 0) as pendente,
          COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_original ELSE 0 END), 0) as pendente_total,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original * 0.10 ELSE 0 END), 0) as atrasado,
          COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_original ELSE 0 END), 0) as atrasado_total
        FROM pagamentos
        WHERE data_vencimento >= CURRENT_DATE - INTERVAL '12 months'
          AND tipo = 'aluguel'
      `

      pagamentos = await sql`
        SELECT
          p.id,
          i.endereco_logradouro || ', ' || i.endereco_numero as contrato,
          inq.nome as inquilino,
          p.tipo,
          p.valor_original as valor,
          p.data_vencimento as vencimento,
          CASE
            WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
            ELSE 0
          END as dias_atraso
        FROM pagamentos p
        JOIN contratos c ON p.contrato_id = c.id
        JOIN imoveis i ON c.imovel_id = i.id
        JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
        WHERE p.status IN ('pendente', 'atrasado')
          AND p.data_vencimento >= CURRENT_DATE - INTERVAL '12 months'
        ORDER BY p.data_vencimento ASC
        LIMIT 5
      `
    }

    // Buscar contratos recentes (sempre os 5 mais recentes, independente do período)
    const contratos = await sql`
      SELECT
        c.id,
        i.endereco_logradouro || ', ' || i.endereco_numero as imovel,
        inq.nome as inquilino,
        c.data_inicio,
        c.valor_aluguel as valor
      FROM contratos c
      JOIN imoveis i ON c.imovel_id = i.id
      JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
      WHERE c.status = 'ativo'
      ORDER BY c.data_inicio DESC
      LIMIT 5
    `

    // Buscar receita mensal para o gráfico (últimos 6 meses sempre)
    const receitaMensal = await sql`
      SELECT
        TO_CHAR(data_vencimento, 'Mon') as mes,
        EXTRACT(MONTH FROM data_vencimento) as mes_numero,
        COALESCE(SUM(valor_original * 0.10), 0) as valor
      FROM pagamentos
      WHERE data_vencimento >= CURRENT_DATE - INTERVAL '6 months'
        AND status = 'pago'
        AND tipo = 'aluguel'
      GROUP BY TO_CHAR(data_vencimento, 'Mon'), EXTRACT(MONTH FROM data_vencimento)
      ORDER BY EXTRACT(MONTH FROM data_vencimento) ASC
    `

    // Buscar receita total para o gráfico (últimos 6 meses sempre)
    const receitaTotal = await sql`
      SELECT
        TO_CHAR(data_vencimento, 'Mon') as mes,
        EXTRACT(MONTH FROM data_vencimento) as mes_numero,
        COALESCE(SUM(valor_original), 0) as valor
      FROM pagamentos
      WHERE data_vencimento >= CURRENT_DATE - INTERVAL '6 months'
        AND status = 'pago'
        AND tipo = 'aluguel'
      GROUP BY TO_CHAR(data_vencimento, 'Mon'), EXTRACT(MONTH FROM data_vencimento)
      ORDER BY EXTRACT(MONTH FROM data_vencimento) ASC
    `

    const result = {
      success: true,
      data: {
        financeiro: {
          receitaMensal: Number(financeiroStats[0].receita_mensal),
          receitaTotal: Number(financeiroStats[0].receita_total),
          recebido: Number(financeiroStats[0].recebido),
          recebidoTotal: Number(financeiroStats[0].recebido_total),
          pendente: Number(financeiroStats[0].pendente),
          pendenteTotal: Number(financeiroStats[0].pendente_total),
          atrasado: Number(financeiroStats[0].atrasado),
          atrasadoTotal: Number(financeiroStats[0].atrasado_total),
        },
        pagamentosPendentes: pagamentos.map((p) => ({
          id: p.id,
          contrato: p.contrato,
          inquilino: p.inquilino,
          tipo: p.tipo,
          valor: Number(p.valor),
          vencimento: p.vencimento,
          diasAtraso: Number(p.dias_atraso),
        })),
        contratosRecentes: contratos.map((c) => ({
          id: c.id,
          imovel: c.imovel,
          inquilino: c.inquilino,
          dataInicio: c.data_inicio,
          valor: Number(c.valor),
        })),
        receitaMensal: receitaMensal.map((r) => ({
          mes: r.mes,
          valor: Number(r.valor),
        })),
        receitaTotal: receitaTotal.map((r) => ({
          mes: r.mes,
          valor: Number(r.valor),
        })),
      },
    }

    console.log("[Dashboard] Result financeiro:", result.data.financeiro)

    return result
  } catch (error) {
    console.error("[v0] Error fetching dashboard data by period:", error)
    return { success: false, error: "Erro ao buscar dados do dashboard" }
  }
}
