"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getDocumentos() {
  try {
    const documentos = await sql`
      SELECT * FROM documentos
      ORDER BY created_at DESC
    `
    return { success: true, data: documentos }
  } catch (error) {
    console.error("[v0] Error fetching documentos:", error)
    return { success: false, error: "Erro ao buscar documentos" }
  }
}

export async function getDocumentosByEntidade(tipoEntidade: string, entidadeId: string) {
  try {
    const documentos = await sql`
      SELECT * FROM documentos
      WHERE tipo_entidade = ${tipoEntidade}
        AND entidade_id = ${entidadeId}
      ORDER BY created_at DESC
    `
    return { success: true, data: documentos }
  } catch (error) {
    console.error("[v0] Error fetching documentos by entidade:", error)
    return { success: false, error: "Erro ao buscar documentos" }
  }
}

export async function createDocumento(data: {
  tipo_entidade: string
  entidade_id: number
  tipo_documento: string
  nome_arquivo: string
  url_arquivo: string
  tamanho_bytes: number
  categoria: string | null
  observacoes: string | null
}) {
  try {
    const [documento] = await sql`
      INSERT INTO documentos (
        tipo_entidade, entidade_id, tipo_documento, nome_arquivo,
        url_arquivo, tamanho_bytes, categoria, observacoes
      ) VALUES (
        ${data.tipo_entidade}, ${data.entidade_id}, ${data.tipo_documento},
        ${data.nome_arquivo}, ${data.url_arquivo}, ${data.tamanho_bytes},
        ${data.categoria}, ${data.observacoes}
      )
      RETURNING *
    `

    revalidatePath("/documentos")
    return { success: true, data: documento }
  } catch (error) {
    console.error("[v0] Error creating documento:", error)
    return { success: false, error: "Erro ao criar documento" }
  }
}

export async function deleteDocumento(id: number) {
  try {
    await sql`DELETE FROM documentos WHERE id = ${id}`

    revalidatePath("/documentos")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting documento:", error)
    return { success: false, error: "Erro ao deletar documento" }
  }
}
