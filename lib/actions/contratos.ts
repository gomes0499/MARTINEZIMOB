import { sql } from "@/lib/db"

export interface Contrato {
  id: number
  imovel_id: number
  data_inicio: string
  data_fim: string
  valor_aluguel: number
  dia_vencimento: number
  tipo_reajuste: string
  indice_reajuste?: string
  periodicidade_reajuste?: number
  tipo_garantia: string
  valor_garantia?: number
  taxa_administracao: number
  observacoes?: string
  status: string
  created_at: string
  updated_at: string
}

export interface ContratoInquilino {
  id: number
  contrato_id: number
  inquilino_id: number
  tipo: string
  created_at: string
}

export async function getContratos() {
  try {
    const contratos = await sql`
      SELECT
        c.*,
        i.endereco_logradouro || ', ' || i.endereco_numero || ' - ' || i.endereco_bairro as imovel_endereco,
        i.endereco_complemento as imovel_nome,
        inq.nome as inquilino_nome,
        inq.cpf_cnpj as inquilino_cpf_cnpj,
        p.nome as proprietario_nome
      FROM contratos c
      JOIN imoveis i ON c.imovel_id = i.id
      JOIN proprietarios p ON i.proprietario_id = p.id
      LEFT JOIN inquilinos inq ON c.inquilino_principal_id = inq.id
      ORDER BY c.created_at DESC
    `
    return { success: true, data: contratos }
  } catch (error) {
    console.error("[v0] Error fetching contratos:", error)
    return { success: false, error: "Erro ao buscar contratos" }
  }
}

export async function getContratoById(id: number) {
  try {
    const [contrato] = await sql`
      SELECT 
        c.*,
        i.endereco_logradouro as imovel_endereco,
        i.endereco_numero as imovel_numero,
        i.endereco_bairro as imovel_bairro,
        i.endereco_cidade as imovel_cidade,
        p.nome as proprietario_nome
      FROM contratos c
      JOIN imoveis i ON c.imovel_id = i.id
      JOIN proprietarios p ON i.proprietario_id = p.id
      WHERE c.id = ${id}
    `

    if (!contrato) {
      throw new Error("Contrato não encontrado")
    }

    // Buscar inquilinos do contrato
    const inquilinos = await sql`
      SELECT 
        ci.*,
        inq.nome,
        inq.cpf,
        inq.email,
        inq.telefone
      FROM contrato_inquilinos ci
      JOIN inquilinos inq ON ci.inquilino_id = inq.id
      WHERE ci.contrato_id = ${id}
    `

    return { ...contrato, inquilinos }
  } catch (error) {
    console.error("[v0] Error fetching contrato:", error)
    throw new Error("Erro ao buscar contrato")
  }
}

export async function createContrato(data: {
  imovel_id: number
  inquilinos: { id: number; tipo: string }[]
  data_inicio: string
  data_fim: string
  valor_aluguel: number
  dia_vencimento: number
  tipo_reajuste: string
  indice_reajuste?: string
  periodicidade_reajuste?: number
  tipo_garantia: string
  valor_garantia?: number
  taxa_administracao: number
  observacoes?: string
}) {
  try {
    // Criar contrato
    const [contrato] = await sql`
      INSERT INTO contratos (
        imovel_id, data_inicio, data_fim, valor_aluguel, dia_vencimento,
        tipo_reajuste, indice_reajuste, periodicidade_reajuste,
        tipo_garantia, valor_garantia, taxa_administracao, observacoes, status
      ) VALUES (
        ${data.imovel_id}, ${data.data_inicio}, ${data.data_fim}, ${data.valor_aluguel},
        ${data.dia_vencimento}, ${data.tipo_reajuste}, ${data.indice_reajuste || null},
        ${data.periodicidade_reajuste || null}, ${data.tipo_garantia}, ${data.valor_garantia || null},
        ${data.taxa_administracao}, ${data.observacoes || null}, 'ativo'
      )
      RETURNING *
    `

    // Adicionar inquilinos ao contrato
    for (const inquilino of data.inquilinos) {
      await sql`
        INSERT INTO contrato_inquilinos (contrato_id, inquilino_id, tipo)
        VALUES (${contrato.id}, ${inquilino.id}, ${inquilino.tipo})
      `
    }

    // Atualizar status do imóvel para locado
    await sql`
      UPDATE imoveis 
      SET status = 'locado'
      WHERE id = ${data.imovel_id}
    `

    // Gerar parcelas de pagamento
    await gerarParcelas(contrato.id, data.data_inicio, data.data_fim, data.valor_aluguel, data.dia_vencimento)

    return contrato
  } catch (error) {
    console.error("[v0] Error creating contrato:", error)
    throw new Error("Erro ao criar contrato")
  }
}

async function gerarParcelas(
  contratoId: number,
  dataInicio: string,
  dataFim: string,
  valorAluguel: number,
  diaVencimento: number,
) {
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)

  const dataAtual = new Date(inicio.getFullYear(), inicio.getMonth(), diaVencimento)

  // Se o dia de vencimento já passou no mês de início, começar no próximo mês
  if (dataAtual < inicio) {
    dataAtual.setMonth(dataAtual.getMonth() + 1)
  }

  while (dataAtual <= fim) {
    const dataVencimento = dataAtual.toISOString().split("T")[0]

    await sql`
      INSERT INTO pagamentos (
        contrato_id, tipo, valor, data_vencimento, status
      ) VALUES (
        ${contratoId}, 'aluguel', ${valorAluguel}, ${dataVencimento}, 'pendente'
      )
    `

    dataAtual.setMonth(dataAtual.getMonth() + 1)
  }
}

export async function updateContrato(id: number, data: Partial<Contrato>) {
  try {
    const [contrato] = await sql`
      UPDATE contratos
      SET 
        data_fim = COALESCE(${data.data_fim}, data_fim),
        valor_aluguel = COALESCE(${data.valor_aluguel}, valor_aluguel),
        dia_vencimento = COALESCE(${data.dia_vencimento}, dia_vencimento),
        tipo_reajuste = COALESCE(${data.tipo_reajuste}, tipo_reajuste),
        indice_reajuste = COALESCE(${data.indice_reajuste}, indice_reajuste),
        periodicidade_reajuste = COALESCE(${data.periodicidade_reajuste}, periodicidade_reajuste),
        tipo_garantia = COALESCE(${data.tipo_garantia}, tipo_garantia),
        valor_garantia = COALESCE(${data.valor_garantia}, valor_garantia),
        taxa_administracao = COALESCE(${data.taxa_administracao}, taxa_administracao),
        observacoes = COALESCE(${data.observacoes}, observacoes),
        status = COALESCE(${data.status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return contrato
  } catch (error) {
    console.error("[v0] Error updating contrato:", error)
    throw new Error("Erro ao atualizar contrato")
  }
}

export async function deleteContrato(id: number) {
  try {
    // Buscar o imóvel do contrato antes de deletar
    const [contrato] = await sql`SELECT imovel_id FROM contratos WHERE id = ${id}`

    // Deletar inquilinos do contrato
    await sql`DELETE FROM contrato_inquilinos WHERE contrato_id = ${id}`

    // Deletar pagamentos do contrato
    await sql`DELETE FROM pagamentos WHERE contrato_id = ${id}`

    // Deletar contrato
    await sql`DELETE FROM contratos WHERE id = ${id}`

    // Atualizar status do imóvel para disponível
    if (contrato) {
      await sql`
        UPDATE imoveis 
        SET status = 'disponivel'
        WHERE id = ${contrato.imovel_id}
      `
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting contrato:", error)
    throw new Error("Erro ao deletar contrato")
  }
}
