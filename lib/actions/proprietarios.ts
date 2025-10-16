"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type Proprietario = {
  id: string
  tipo_pessoa: "fisica" | "juridica"
  nome: string
  cpf_cnpj: string
  email?: string
  telefone?: string
  celular?: string
  endereco_cep: string
  endereco_logradouro: string
  endereco_numero: string
  endereco_complemento?: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_estado: string
  banco?: string
  agencia?: string
  conta?: string
  tipo_conta?: string
  pix?: string
  observacoes?: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

export async function getProprietarios() {
  try {
    const result = await sql`
      SELECT * FROM proprietarios 
      ORDER BY nome ASC
    `
    return { success: true, data: result as Proprietario[] }
  } catch (error) {
    console.error("[v0] Error fetching proprietarios:", error)
    return { success: false, error: "Erro ao buscar proprietários" }
  }
}

export async function createProprietario(data: Omit<Proprietario, "id" | "created_at" | "updated_at">) {
  try {
    const result = await sql`
      INSERT INTO proprietarios (
        tipo_pessoa, nome, cpf_cnpj, email, telefone, celular,
        endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_estado,
        banco, agencia, conta, tipo_conta, pix, observacoes, ativo
      ) VALUES (
        ${data.tipo_pessoa}, ${data.nome}, ${data.cpf_cnpj}, ${data.email}, 
        ${data.telefone}, ${data.celular}, ${data.endereco_cep}, ${data.endereco_logradouro},
        ${data.endereco_numero}, ${data.endereco_complemento || null}, ${data.endereco_bairro},
        ${data.endereco_cidade}, ${data.endereco_estado}, ${data.banco || null},
        ${data.agencia || null}, ${data.conta || null}, ${data.tipo_conta || null},
        ${data.pix || null}, ${data.observacoes || null}, ${data.ativo}
      )
      RETURNING *
    `
    revalidatePath("/proprietarios")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("[v0] Error creating proprietario:", error)
    return { success: false, error: "Erro ao criar proprietário" }
  }
}

export async function updateProprietario(
  id: string,
  data: Partial<Omit<Proprietario, "id" | "created_at" | "updated_at">>,
) {
  try {
    const result = await sql`
      UPDATE proprietarios SET
        tipo_pessoa = COALESCE(${data.tipo_pessoa || null}, tipo_pessoa),
        nome = COALESCE(${data.nome || null}, nome),
        cpf_cnpj = COALESCE(${data.cpf_cnpj || null}, cpf_cnpj),
        email = COALESCE(${data.email || null}, email),
        telefone = COALESCE(${data.telefone || null}, telefone),
        celular = COALESCE(${data.celular || null}, celular),
        endereco_cep = COALESCE(${data.endereco_cep || null}, endereco_cep),
        endereco_logradouro = COALESCE(${data.endereco_logradouro || null}, endereco_logradouro),
        endereco_numero = COALESCE(${data.endereco_numero || null}, endereco_numero),
        endereco_complemento = ${data.endereco_complemento || null},
        endereco_bairro = COALESCE(${data.endereco_bairro || null}, endereco_bairro),
        endereco_cidade = COALESCE(${data.endereco_cidade || null}, endereco_cidade),
        endereco_estado = COALESCE(${data.endereco_estado || null}, endereco_estado),
        banco = ${data.banco || null},
        agencia = ${data.agencia || null},
        conta = ${data.conta || null},
        tipo_conta = ${data.tipo_conta || null},
        pix = ${data.pix || null},
        observacoes = ${data.observacoes || null},
        ativo = COALESCE(${data.ativo !== undefined ? data.ativo : null}, ativo),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/proprietarios")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("[v0] Error updating proprietario:", error)
    return { success: false, error: "Erro ao atualizar proprietário" }
  }
}

export async function deleteProprietario(id: string) {
  try {
    await sql`DELETE FROM proprietarios WHERE id = ${id}`
    revalidatePath("/proprietarios")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting proprietario:", error)
    return { success: false, error: "Erro ao excluir proprietário" }
  }
}

export async function getProprietarioById(id: string) {
  try {
    const proprietario = await sql`
      SELECT * FROM proprietarios WHERE id = ${id}
    `

    if (proprietario.length === 0) {
      return { success: false, error: "Proprietário não encontrado" }
    }

    // Buscar imóveis do proprietário
    const imoveis = await sql`
      SELECT * FROM imoveis WHERE proprietario_id = ${id} ORDER BY created_at DESC
    `

    // Buscar documentos do proprietário
    const documentos = await sql`
      SELECT * FROM documentos 
      WHERE tipo_entidade = 'proprietario' AND entidade_id = ${id}
      ORDER BY created_at DESC
    `

    // Buscar interações do proprietário
    const interacoes = await sql`
      SELECT * FROM interacoes 
      WHERE tipo_entidade = 'proprietario' AND entidade_id = ${id}
      ORDER BY data_interacao DESC
    `

    return {
      success: true,
      data: {
        proprietario: proprietario[0] as Proprietario,
        imoveis,
        documentos,
        interacoes,
      },
    }
  } catch (error) {
    console.error("[v0] Error fetching proprietario by id:", error)
    return { success: false, error: "Erro ao buscar proprietário" }
  }
}
