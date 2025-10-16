"use server"

import { sql } from "@/lib/db"

export async function getRelatorioFinanceiro(dataInicio: string, dataFim: string) {
  try {
    const dados = await sql`
      SELECT 
        COALESCE(SUM(valor_total), 0) as receita_total,
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_pago ELSE 0 END), 0) as recebido,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_total ELSE 0 END), 0) as pendente,
        COALESCE(SUM(CASE WHEN status = 'atrasado' THEN valor_total ELSE 0 END), 0) as atrasado
      FROM pagamentos
      WHERE data_vencimento BETWEEN ${dataInicio}::date AND ${dataFim}::date
    `

    const repasses = await sql`
      SELECT COALESCE(SUM(valor_liquido), 0) as total_repasses
      FROM repasses
      WHERE data_repasse BETWEEN ${dataInicio}::date AND ${dataFim}::date
    `

    const receitaTotal = Number(dados[0].receita_total)
    const recebido = Number(dados[0].recebido)
    const taxasAdministracao = receitaTotal * 0.1 // 10% de taxa
    const repasseProprietarios = Number(repasses[0].total_repasses)

    return {
      success: true,
      data: {
        receitaTotal,
        recebido: Number(dados[0].recebido),
        pendente: Number(dados[0].pendente),
        atrasado: Number(dados[0].atrasado),
        taxasAdministracao,
        repasseProprietarios,
        taxaInadimplencia: receitaTotal > 0 ? (Number(dados[0].atrasado) / receitaTotal) * 100 : 0,
      },
    }
  } catch (error) {
    console.error("[v0] Error generating financial report:", error)
    return { success: false, error: "Erro ao gerar relatório financeiro" }
  }
}

export async function getRelatorioProprietario(dataInicio: string, dataFim: string) {
  try {
    const dados = await sql`
      SELECT 
        p.id,
        p.nome,
        p.cpf_cnpj,
        COUNT(DISTINCT i.id) as total_imoveis,
        COUNT(DISTINCT CASE WHEN i.status = 'locado' THEN i.id END) as imoveis_locados,
        COALESCE(SUM(r.valor_liquido), 0) as total_repasses
      FROM proprietarios p
      LEFT JOIN imoveis i ON p.id = i.proprietario_id
      LEFT JOIN contratos c ON i.id = c.imovel_id
      LEFT JOIN repasses r ON c.id = r.contrato_id 
        AND r.data_repasse BETWEEN ${dataInicio}::date AND ${dataFim}::date
      GROUP BY p.id, p.nome, p.cpf_cnpj
      ORDER BY total_repasses DESC
    `

    return {
      success: true,
      data: dados.map((d) => ({
        id: d.id,
        nome: d.nome,
        cpfCnpj: d.cpf_cnpj,
        totalImoveis: Number(d.total_imoveis),
        imoveisLocados: Number(d.imoveis_locados),
        totalRepasses: Number(d.total_repasses),
      })),
    }
  } catch (error) {
    console.error("[v0] Error generating proprietario report:", error)
    return { success: false, error: "Erro ao gerar relatório por proprietário" }
  }
}

export async function getRelatorioImoveis(dataInicio: string, dataFim: string) {
  try {
    const dados = await sql`
      SELECT 
        i.id,
        i.endereco_logradouro || ', ' || i.endereco_numero || ' - ' || i.endereco_bairro as endereco_completo,
        i.status,
        p.nome as proprietario,
        i.valor_aluguel,
        COALESCE(SUM(CASE WHEN pg.status = 'pago' THEN pg.valor_pago ELSE 0 END), 0) as receita_periodo
      FROM imoveis i
      JOIN proprietarios p ON i.proprietario_id = p.id
      LEFT JOIN contratos c ON i.id = c.imovel_id
      LEFT JOIN pagamentos pg ON c.id = pg.contrato_id 
        AND pg.data_vencimento BETWEEN ${dataInicio}::date AND ${dataFim}::date
      GROUP BY i.id, i.endereco_logradouro, i.endereco_numero, i.endereco_bairro, i.status, p.nome, i.valor_aluguel
      ORDER BY receita_periodo DESC
    `

    const totais = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'locado') as locados,
        COUNT(*) FILTER (WHERE status = 'disponivel') as disponiveis,
        COUNT(*) FILTER (WHERE status = 'manutencao') as manutencao
      FROM imoveis
    `

    return {
      success: true,
      data: {
        imoveis: dados.map((d) => ({
          id: d.id,
          enderecoCompleto: d.endereco_completo,
          status: d.status,
          proprietario: d.proprietario,
          valorAluguel: Number(d.valor_aluguel),
          receitaPeriodo: Number(d.receita_periodo),
        })),
        totais: {
          total: Number(totais[0].total),
          locados: Number(totais[0].locados),
          disponiveis: Number(totais[0].disponiveis),
          manutencao: Number(totais[0].manutencao),
          taxaOcupacao: Number(totais[0].total) > 0 ? (Number(totais[0].locados) / Number(totais[0].total)) * 100 : 0,
        },
      },
    }
  } catch (error) {
    console.error("[v0] Error generating imoveis report:", error)
    return { success: false, error: "Erro ao gerar relatório de imóveis" }
  }
}

export async function getRelatorioInadimplencia(dataInicio: string, dataFim: string) {
  try {
    const dados = await sql`
      SELECT 
        p.id,
        i.endereco_logradouro || ', ' || i.endereco_numero as imovel,
        inq.nome as inquilino,
        inq.telefone,
        p.tipo,
        p.valor_total,
        p.data_vencimento,
        CURRENT_DATE - p.data_vencimento as dias_atraso
      FROM pagamentos p
      JOIN contratos c ON p.contrato_id = c.id
      JOIN imoveis i ON c.imovel_id = i.id
      JOIN contrato_inquilinos ci ON c.id = ci.contrato_id
      JOIN inquilinos inq ON ci.inquilino_id = inq.id
      WHERE p.status = 'atrasado'
        AND p.data_vencimento BETWEEN ${dataInicio}::date AND ${dataFim}::date
      ORDER BY dias_atraso DESC
    `

    const totais = await sql`
      SELECT 
        COUNT(*) as total_atrasados,
        COALESCE(SUM(valor_total), 0) as valor_total_atrasado
      FROM pagamentos
      WHERE status = 'atrasado'
        AND data_vencimento BETWEEN ${dataInicio}::date AND ${dataFim}::date
    `

    return {
      success: true,
      data: {
        pagamentos: dados.map((d) => ({
          id: d.id,
          imovel: d.imovel,
          inquilino: d.inquilino,
          telefone: d.telefone,
          tipo: d.tipo,
          valorTotal: Number(d.valor_total),
          dataVencimento: d.data_vencimento,
          diasAtraso: Number(d.dias_atraso),
        })),
        totais: {
          totalAtrasados: Number(totais[0].total_atrasados),
          valorTotalAtrasado: Number(totais[0].valor_total_atrasado),
        },
      },
    }
  } catch (error) {
    console.error("[v0] Error generating inadimplencia report:", error)
    return { success: false, error: "Erro ao gerar relatório de inadimplência" }
  }
}
