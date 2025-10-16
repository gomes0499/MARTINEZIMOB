import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Pagamento {
  id: string
  contrato_id: string
  tipo: string
  mes_referencia: string
  data_vencimento: string
  valor_original: number
  valor_pago?: number
  data_pagamento?: string
  dias_atraso?: number
  valor_multa?: number
  valor_juros?: number
  valor_desconto?: number
  valor_total?: number
  forma_pagamento?: string
  status: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export async function getPagamentos(mes?: string, ano?: string) {
  try {
    if (mes && ano) {
      const pagamentos = await sql`
        SELECT
          p.*,
          c.valor_aluguel,
          c.taxa_administracao,
          i.endereco_logradouro || ', ' || i.endereco_numero || ' - ' || i.endereco_bairro as imovel_endereco,
          i.endereco_complemento as imovel_nome,
          inq.nome as inquilino_nome,
          prop.nome as proprietario_nome
        FROM pagamentos p
        JOIN contratos c ON p.contrato_id = c.id
        JOIN imoveis i ON c.imovel_id = i.id
        JOIN proprietarios prop ON i.proprietario_id = prop.id
        LEFT JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
        WHERE EXTRACT(MONTH FROM p.data_vencimento) = ${Number.parseInt(mes)}
          AND EXTRACT(YEAR FROM p.data_vencimento) = ${Number.parseInt(ano)}
        ORDER BY p.data_vencimento ASC
      `
      return { success: true, data: pagamentos }
    }

    const pagamentos = await sql`
      SELECT
        p.*,
        c.valor_aluguel,
        c.taxa_administracao,
        i.endereco_logradouro || ', ' || i.endereco_numero || ' - ' || i.endereco_bairro as imovel_endereco,
        i.endereco_complemento as imovel_nome,
        inq.nome as inquilino_nome,
        prop.nome as proprietario_nome
      FROM pagamentos p
      JOIN contratos c ON p.contrato_id = c.id
      JOIN imoveis i ON c.imovel_id = i.id
      JOIN proprietarios prop ON i.proprietario_id = prop.id
      LEFT JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
      ORDER BY p.data_vencimento ASC
    `
    return { success: true, data: pagamentos }
  } catch (error) {
    console.error("[v0] Error fetching pagamentos:", error)
    return { success: false, error: "Erro ao buscar pagamentos" }
  }
}

export async function registrarPagamento(
  id: number,
  data: {
    data_pagamento: string
    valor_pago: number
    forma_pagamento: string
    multa?: number
    juros?: number
    desconto?: number
    observacoes?: string
  },
) {
  try {
    const [pagamento] = await sql`
      UPDATE pagamentos
      SET
        data_pagamento = ${data.data_pagamento},
        valor_pago = ${data.valor_pago},
        forma_pagamento = ${data.forma_pagamento},
        multa = ${data.multa || 0},
        juros = ${data.juros || 0},
        desconto = ${data.desconto || 0},
        observacoes = ${data.observacoes || null},
        status = 'pago',
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    // Criar repasse para o proprietário
    const [contratoInfo] = await sql`
      SELECT
        c.taxa_administracao,
        i.proprietario_id
      FROM contratos c
      JOIN imoveis i ON c.imovel_id = i.id
      WHERE c.id = ${pagamento.contrato_id}
    `

    const valorRepasse = data.valor_pago - (data.valor_pago * contratoInfo.taxa_administracao) / 100

    await sql`
      INSERT INTO repasses (
        proprietario_id, pagamento_id, valor_bruto, taxa_administracao,
        valor_liquido, data_prevista, status
      ) VALUES (
        ${contratoInfo.proprietario_id}, ${pagamento.id}, ${data.valor_pago},
        ${contratoInfo.taxa_administracao}, ${valorRepasse}, ${data.data_pagamento}, 'pendente'
      )
    `

    return { success: true, data: pagamento }
  } catch (error) {
    console.error("[v0] Error registering pagamento:", error)
    return { success: false, error: "Erro ao registrar pagamento" }
  }
}

export async function deletePagamento(id: number) {
  try {
    await sql`DELETE FROM pagamentos WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting pagamento:", error)
    throw new Error("Erro ao deletar pagamento")
  }
}

/**
 * Gera pagamentos mensais para um contrato específico
 * - Gera pagamentos de aluguel do início do contrato até o fim
 * - Calcula status baseado na data de vencimento (pendente ou atrasado)
 */
export async function gerarPagamentosContrato(contratoId: string) {
  try {
    // Buscar informações do contrato
    const [contrato] = await sql`
      SELECT
        id,
        valor_aluguel,
        dia_vencimento,
        data_inicio,
        data_fim,
        status
      FROM contratos
      WHERE id = ${contratoId}
    `

    if (!contrato) {
      return { success: false, error: "Contrato não encontrado" }
    }

    if (contrato.status !== "ativo") {
      return { success: false, error: "Contrato não está ativo" }
    }

    // Verificar se já existem pagamentos para este contrato
    const [existingPayments] = await sql`
      SELECT COUNT(*) as count
      FROM pagamentos
      WHERE contrato_id = ${contratoId}
    `

    if (existingPayments.count > 0) {
      return { success: false, error: "Já existem pagamentos para este contrato" }
    }

    const dataInicio = new Date(contrato.data_inicio)
    const dataFim = new Date(contrato.data_fim)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const pagamentos = []

    // Gerar pagamentos mensais
    let mesAtual = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), contrato.dia_vencimento)

    // Se o dia de vencimento é antes da data de início no primeiro mês, começar no próximo mês
    if (mesAtual < dataInicio) {
      mesAtual.setMonth(mesAtual.getMonth() + 1)
    }

    while (mesAtual <= dataFim) {
      const mesReferencia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)

      // Determinar status baseado na data de vencimento
      let status = "pendente"
      if (mesAtual < hoje) {
        status = "atrasado"
      }

      pagamentos.push({
        contrato_id: contratoId,
        tipo: "aluguel",
        mes_referencia: mesReferencia.toISOString().split("T")[0],
        data_vencimento: mesAtual.toISOString().split("T")[0],
        valor_original: contrato.valor_aluguel,
        status: status,
      })

      // Próximo mês
      mesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, contrato.dia_vencimento)
    }

    // Inserir todos os pagamentos
    for (const pagamento of pagamentos) {
      await sql`
        INSERT INTO pagamentos (
          contrato_id,
          tipo,
          mes_referencia,
          data_vencimento,
          valor_original,
          status
        ) VALUES (
          ${pagamento.contrato_id},
          ${pagamento.tipo},
          ${pagamento.mes_referencia},
          ${pagamento.data_vencimento},
          ${pagamento.valor_original},
          ${pagamento.status}
        )
      `
    }

    return { success: true, data: { count: pagamentos.length } }
  } catch (error) {
    console.error("[v0] Error generating pagamentos:", error)
    return { success: false, error: "Erro ao gerar pagamentos" }
  }
}

/**
 * Gera pagamentos para todos os contratos ativos que ainda não possuem pagamentos
 */
export async function gerarPagamentosTodosContratos() {
  try {
    // Buscar todos os contratos ativos
    const contratos = await sql`
      SELECT id
      FROM contratos
      WHERE status = 'ativo'
    `

    let totalGerados = 0
    const erros: string[] = []

    for (const contrato of contratos) {
      const result = await gerarPagamentosContrato(contrato.id)
      if (result.success && result.data) {
        totalGerados += result.data.count
      } else if (!result.success && !result.error?.includes("Já existem pagamentos")) {
        erros.push(`Contrato ${contrato.id}: ${result.error}`)
      }
    }

    return {
      success: true,
      data: {
        contratos: contratos.length,
        pagamentosGerados: totalGerados,
        erros,
      },
    }
  } catch (error) {
    console.error("[v0] Error generating pagamentos for all contratos:", error)
    return { success: false, error: "Erro ao gerar pagamentos para todos os contratos" }
  }
}
