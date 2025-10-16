"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type Imovel = {
  id: string
  proprietario_id: string
  tipo: string
  status: "disponivel" | "locado" | "manutencao"
  endereco_cep: string
  endereco_logradouro: string
  endereco_numero: string
  endereco_complemento?: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_estado: string
  descricao?: string
  area_total?: number
  area_construida?: number
  quartos: number
  banheiros: number
  vagas_garagem: number
  valor_aluguel: number
  valor_condominio?: number
  iptu_anual?: number
  iptu_mensal?: number
  conta_luz?: string
  conta_agua?: string
  conta_gas?: string
  observacoes?: string
  created_at: Date
  updated_at: Date
}

export async function getImoveis() {
  try {
    const result = await sql`
      SELECT i.*, p.nome as proprietario_nome
      FROM imoveis i
      LEFT JOIN proprietarios p ON i.proprietario_id = p.id
      ORDER BY i.created_at DESC
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Error fetching imoveis:", error)
    return { success: false, error: "Erro ao buscar imóveis" }
  }
}

export async function createImovel(data: Omit<Imovel, "id" | "created_at" | "updated_at">) {
  try {
    const result = await sql`
      INSERT INTO imoveis (
        proprietario_id, tipo, status, endereco_cep, endereco_logradouro,
        endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade,
        endereco_estado, descricao, area_total, area_construida, quartos,
        banheiros, vagas_garagem, valor_aluguel, valor_condominio,
        iptu_anual, iptu_mensal, conta_luz, conta_agua, conta_gas, observacoes
      ) VALUES (
        ${data.proprietario_id}, ${data.tipo}, ${data.status}, ${data.endereco_cep},
        ${data.endereco_logradouro}, ${data.endereco_numero}, ${data.endereco_complemento || null},
        ${data.endereco_bairro}, ${data.endereco_cidade}, ${data.endereco_estado},
        ${data.descricao || null}, ${data.area_total || null}, ${data.area_construida || null},
        ${data.quartos}, ${data.banheiros}, ${data.vagas_garagem}, ${data.valor_aluguel},
        ${data.valor_condominio || null}, ${data.iptu_anual || null}, ${data.iptu_mensal || null},
        ${data.conta_luz || null}, ${data.conta_agua || null}, ${data.conta_gas || null},
        ${data.observacoes || null}
      )
      RETURNING *
    `
    revalidatePath("/imoveis")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("[v0] Error creating imovel:", error)
    return { success: false, error: "Erro ao criar imóvel" }
  }
}

export async function updateImovel(id: string, data: Partial<Omit<Imovel, "id" | "created_at" | "updated_at">>) {
  try {
    const updates: string[] = []
    const values: any[] = []

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${values.length + 1}`)
        values.push(value)
      }
    })

    if (updates.length === 0) {
      return { success: false, error: "Nenhum campo para atualizar" }
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const result = await sql`
      UPDATE imoveis SET
        proprietario_id = COALESCE(${data.proprietario_id || null}, proprietario_id),
        tipo = COALESCE(${data.tipo || null}, tipo),
        status = COALESCE(${data.status || null}, status),
        endereco_cep = COALESCE(${data.endereco_cep || null}, endereco_cep),
        endereco_logradouro = COALESCE(${data.endereco_logradouro || null}, endereco_logradouro),
        endereco_numero = COALESCE(${data.endereco_numero || null}, endereco_numero),
        endereco_complemento = ${data.endereco_complemento || null},
        endereco_bairro = COALESCE(${data.endereco_bairro || null}, endereco_bairro),
        endereco_cidade = COALESCE(${data.endereco_cidade || null}, endereco_cidade),
        endereco_estado = COALESCE(${data.endereco_estado || null}, endereco_estado),
        descricao = ${data.descricao || null},
        area_total = ${data.area_total || null},
        area_construida = ${data.area_construida || null},
        quartos = COALESCE(${data.quartos || null}, quartos),
        banheiros = COALESCE(${data.banheiros || null}, banheiros),
        vagas_garagem = COALESCE(${data.vagas_garagem || null}, vagas_garagem),
        valor_aluguel = COALESCE(${data.valor_aluguel || null}, valor_aluguel),
        valor_condominio = ${data.valor_condominio || null},
        iptu_anual = ${data.iptu_anual || null},
        iptu_mensal = ${data.iptu_mensal || null},
        conta_luz = ${data.conta_luz || null},
        conta_agua = ${data.conta_agua || null},
        conta_gas = ${data.conta_gas || null},
        observacoes = ${data.observacoes || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/imoveis")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("[v0] Error updating imovel:", error)
    return { success: false, error: "Erro ao atualizar imóvel" }
  }
}

export async function deleteImovel(id: string) {
  try {
    await sql`DELETE FROM imoveis WHERE id = ${id}`
    revalidatePath("/imoveis")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting imovel:", error)
    return { success: false, error: "Erro ao excluir imóvel" }
  }
}
