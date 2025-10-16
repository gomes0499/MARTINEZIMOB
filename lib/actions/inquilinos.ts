"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type Inquilino = {
  id: string
  tipo_pessoa: "fisica" | "juridica"
  nome: string
  cpf_cnpj: string
  email?: string
  telefone?: string
  celular?: string
  estado_civil?: string
  profissao?: string
  data_nascimento?: Date
  renda_mensal?: number
  endereco_cep: string
  endereco_logradouro: string
  endereco_numero: string
  endereco_complemento?: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_estado: string
  observacoes?: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

export async function getInquilinos() {
  try {
    const result = await sql`
      SELECT * FROM inquilinos 
      ORDER BY nome ASC
    `
    return { success: true, data: result as Inquilino[] }
  } catch (error) {
    console.error("[v0] Error fetching inquilinos:", error)
    return { success: false, error: "Erro ao buscar inquilinos" }
  }
}

export async function createInquilino(data: Omit<Inquilino, "id" | "created_at" | "updated_at">) {
  try {
    const result = await sql`
      INSERT INTO inquilinos (
        tipo_pessoa, nome, cpf_cnpj, email, telefone, celular,
        estado_civil, profissao, data_nascimento, renda_mensal,
        endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_estado, observacoes, ativo
      ) VALUES (
        ${data.tipo_pessoa}, ${data.nome}, ${data.cpf_cnpj}, ${data.email || null},
        ${data.telefone || null}, ${data.celular || null}, ${data.estado_civil || null},
        ${data.profissao || null}, ${data.data_nascimento || null}, ${data.renda_mensal || null},
        ${data.endereco_cep}, ${data.endereco_logradouro}, ${data.endereco_numero},
        ${data.endereco_complemento || null}, ${data.endereco_bairro}, ${data.endereco_cidade},
        ${data.endereco_estado}, ${data.observacoes || null}, ${data.ativo}
      )
      RETURNING *
    `
    revalidatePath("/inquilinos")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("[v0] Error creating inquilino:", error)
    return { success: false, error: "Erro ao criar inquilino" }
  }
}

export async function updateInquilino(id: string, data: Partial<Omit<Inquilino, "id" | "created_at" | "updated_at">>) {
  try {
    const result = await sql`
      UPDATE inquilinos SET
        tipo_pessoa = COALESCE(${data.tipo_pessoa || null}, tipo_pessoa),
        nome = COALESCE(${data.nome || null}, nome),
        cpf_cnpj = COALESCE(${data.cpf_cnpj || null}, cpf_cnpj),
        email = COALESCE(${data.email || null}, email),
        telefone = COALESCE(${data.telefone || null}, telefone),
        celular = COALESCE(${data.celular || null}, celular),
        estado_civil = ${data.estado_civil || null},
        profissao = ${data.profissao || null},
        data_nascimento = ${data.data_nascimento || null},
        renda_mensal = ${data.renda_mensal || null},
        endereco_cep = COALESCE(${data.endereco_cep || null}, endereco_cep),
        endereco_logradouro = COALESCE(${data.endereco_logradouro || null}, endereco_logradouro),
        endereco_numero = COALESCE(${data.endereco_numero || null}, endereco_numero),
        endereco_complemento = ${data.endereco_complemento || null},
        endereco_bairro = COALESCE(${data.endereco_bairro || null}, endereco_bairro),
        endereco_cidade = COALESCE(${data.endereco_cidade || null}, endereco_cidade),
        endereco_estado = COALESCE(${data.endereco_estado || null}, endereco_estado),
        observacoes = ${data.observacoes || null},
        ativo = COALESCE(${data.ativo !== undefined ? data.ativo : null}, ativo),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/inquilinos")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("[v0] Error updating inquilino:", error)
    return { success: false, error: "Erro ao atualizar inquilino" }
  }
}

export async function deleteInquilino(id: string) {
  try {
    await sql`DELETE FROM inquilinos WHERE id = ${id}`
    revalidatePath("/inquilinos")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting inquilino:", error)
    return { success: false, error: "Erro ao excluir inquilino" }
  }
}
