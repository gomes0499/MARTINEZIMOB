// Funções de validação
export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, "")

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let resto = 11 - (soma % 11)
  const digito1 = resto >= 10 ? 0 : resto

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  resto = 11 - (soma % 11)
  const digito2 = resto >= 10 ? 0 : resto

  return Number.parseInt(cpf.charAt(9)) === digito1 && Number.parseInt(cpf.charAt(10)) === digito2
}

export function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, "")

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false
  }

  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  const digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== Number.parseInt(digitos.charAt(0))) return false

  tamanho = tamanho + 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  return resultado === Number.parseInt(digitos.charAt(1))
}

export function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, "")
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatarCNPJ(cnpj: string): string {
  cnpj = cnpj.replace(/[^\d]/g, "")
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

export function formatarTelefone(telefone: string): string {
  telefone = telefone.replace(/[^\d]/g, "")
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

export function formatarCEP(cep: string): string {
  cep = cep.replace(/[^\d]/g, "")
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2")
}
