import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Interacao {
  id: string
  tipo_entidade: string
  entidade_id: string
  tipo_interacao: string
  assunto: string
  descricao: string | null
  data_interacao: string
  usuario_responsavel: string | null
  created_at: string
}

export async function getInteracoes(tipoEntidade?: string, entidadeId?: number) {
  try {
    if (tipoEntidade && entidadeId) {
      const interacoes = await sql`
        SELECT * FROM interacoes
        WHERE tipo_entidade = ${tipoEntidade}
          AND entidade_id = ${entidadeId}
        ORDER BY data_interacao DESC
      `
      return { success: true, data: interacoes }
    }

    const interacoes = await sql`
      SELECT * FROM interacoes
      ORDER BY data_interacao DESC
      LIMIT 100
    `
    return { success: true, data: interacoes }
  } catch (error) {
    console.error("[v0] Error fetching interacoes:", error)
    return { success: false, error: "Erro ao buscar interações" }
  }
}

export async function createInteracao(data: {
  tipo_entidade: string
  entidade_id: string
  tipo_interacao: string
  assunto: string
  descricao: string | null
  data_interacao: string
  usuario_responsavel?: string | null
}) {
  try {
    const [interacao] = await sql`
      INSERT INTO interacoes (
        tipo_entidade, entidade_id, tipo_interacao, assunto,
        descricao, data_interacao, usuario_responsavel
      ) VALUES (
        ${data.tipo_entidade}, ${data.entidade_id}, ${data.tipo_interacao},
        ${data.assunto}, ${data.descricao}, ${data.data_interacao},
        ${data.usuario_responsavel || null}
      )
      RETURNING *
    `
    return { success: true, data: interacao }
  } catch (error) {
    console.error("[v0] Error creating interacao:", error)
    return { success: false, error: "Erro ao criar interação" }
  }
}

export async function deleteInteracao(id: string) {
  try {
    await sql`DELETE FROM interacoes WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting interacao:", error)
    return { success: false, error: "Erro ao deletar interação" }
  }
}
