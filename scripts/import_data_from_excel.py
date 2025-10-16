#!/usr/bin/env python3
"""
Script para importar dados reais do Excel (controle-locacao.xlsx) para o banco de dados
"""

import pandas as pd
import psycopg2
import os
import re
import uuid
from datetime import datetime

DATABASE_URL = os.getenv('DATABASE_URL')

def limpar_cpf_cnpj(cpf_cnpj):
    """Remove pontos, traços e espaços do CPF/CNPJ"""
    if pd.isna(cpf_cnpj):
        return None
    return re.sub(r'[^\d]', '', str(cpf_cnpj))

def limpar_telefone(telefone):
    """Limpa formatação de telefone"""
    if pd.isna(telefone):
        return None
    # Remove tudo exceto números
    tel = re.sub(r'[^\d]', '', str(telefone))
    # Se começar com 55 (código do Brasil), remove
    if len(tel) > 11 and tel.startswith('55'):
        tel = tel[2:]
    return tel[:20] if tel else None

def extrair_valor_brl(texto):
    """Extrai valor em BRL de um texto"""
    if pd.isna(texto):
        return None
    # Procura por padrões como R$ 7.500,00 ou 7500,00
    match = re.search(r'R?\$?\s*([\d.]+,\d{2})', str(texto))
    if match:
        valor_str = match.group(1).replace('.', '').replace(',', '.')
        return float(valor_str)
    return None

def extrair_data(texto):
    """Extrai data de um texto no formato DD/MM/YYYY"""
    if pd.isna(texto):
        return None
    # Procura por padrão DD/MM/YYYY
    match = re.search(r'(\d{2})/(\d{2})/(\d{4})', str(texto))
    if match:
        dia, mes, ano = match.groups()
        try:
            return f"{ano}-{mes}-{dia}"
        except:
            return None
    return None

def get_tipo_pessoa(cpf_cnpj):
    """Identifica se é PF ou PJ baseado no CPF/CNPJ"""
    if not cpf_cnpj:
        return 'PF'
    limpo = limpar_cpf_cnpj(cpf_cnpj)
    return 'PJ' if len(limpo) == 14 else 'PF'

def main():
    print("="*80)
    print("📦 IMPORTAÇÃO DE DADOS REAIS - MARTINEZ IMOBILIÁRIA")
    print("="*80)

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        excel_file = 'docs/controle-locacao.xlsx'

        # ====================
        # 1. IMPORTAR PROPRIETÁRIOS
        # ====================
        print("\n📋 1. Importando Proprietários...")
        df_prop = pd.read_excel(excel_file, sheet_name='Proprietários')

        proprietarios_map = {}  # mapa: nome_imovel -> proprietario_id

        for idx, row in df_prop.iterrows():
            nome = row.get('NOME/RAZÃO SOCIAL*')
            cpf_cnpj = limpar_cpf_cnpj(row.get('CPF/CNPJ*'))

            if pd.isna(nome) or not cpf_cnpj:
                continue

            # Verificar se já existe
            cur.execute('SELECT id FROM proprietarios WHERE cpf_cnpj = %s', (cpf_cnpj,))
            existing = cur.fetchone()

            if existing:
                prop_id = existing[0]
            else:
                prop_id = str(uuid.uuid4())
                tipo_pessoa = get_tipo_pessoa(cpf_cnpj)

                # Email único mesmo quando não informado
                email = str(row.get('EMAIL', '')).strip() if not pd.isna(row.get('EMAIL')) else f"prop_{cpf_cnpj}@martinez.temp"

                cur.execute('''
                    INSERT INTO proprietarios (
                        id, tipo_pessoa, nome, cpf_cnpj, email, telefone, celular,
                        endereco_logradouro, observacoes, ativo
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    prop_id,
                    tipo_pessoa,
                    str(nome).strip()[:255],
                    cpf_cnpj,
                    email[:255],
                    limpar_telefone(row.get('WPP/TELEFONE')),
                    limpar_telefone(row.get('WPP/TELEFONE')),
                    str(row.get('ENDEREÇO COMPLETO', ''))[:255] if not pd.isna(row.get('ENDEREÇO COMPLETO')) else None,
                    str(row.get('DADOS BANCÁRIOS', '')) if not pd.isna(row.get('DADOS BANCÁRIOS')) else None,
                    True
                ))

            # Mapear imóvel -> proprietário
            imovel_nome = row.get('IMÓVEL LOCADO:')
            if not pd.isna(imovel_nome):
                proprietarios_map[str(imovel_nome).strip()] = prop_id

        print(f"   ✅ {len(proprietarios_map)} proprietários importados")

        # ====================
        # 2. IMPORTAR INQUILINOS
        # ====================
        print("\n📋 2. Importando Inquilinos...")
        df_inq = pd.read_excel(excel_file, sheet_name='Inquilinos')

        inquilinos_map = {}  # mapa: nome_imovel -> [inquilino_ids]

        for idx, row in df_inq.iterrows():
            nome = row.get('NOME/RAZÃO SOCIAL*')
            cpf_cnpj = limpar_cpf_cnpj(row.get('CPF/CNPJ*'))

            if pd.isna(nome) or not cpf_cnpj:
                continue

            # Verificar se já existe
            cur.execute('SELECT id FROM inquilinos WHERE cpf_cnpj = %s', (cpf_cnpj,))
            existing = cur.fetchone()

            if existing:
                inq_id = existing[0]
            else:
                inq_id = str(uuid.uuid4())
                tipo_pessoa = get_tipo_pessoa(cpf_cnpj)
                data_nasc = row.get('DATA DE NASCIMENTO')
                if isinstance(data_nasc, pd.Timestamp):
                    data_nasc = data_nasc.date()
                else:
                    data_nasc = None

                # Email único mesmo quando não informado
                email = str(row.get('EMAIL*', '')).strip() if not pd.isna(row.get('EMAIL*')) else f"inq_{cpf_cnpj}@martinez.temp"

                cur.execute('''
                    INSERT INTO inquilinos (
                        id, tipo_pessoa, nome, cpf_cnpj, email, telefone, celular,
                        data_nascimento, endereco_logradouro, ativo
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    inq_id,
                    tipo_pessoa,
                    str(nome).strip()[:255],
                    cpf_cnpj,
                    email[:255],
                    limpar_telefone(row.get('WPP/TELEFONE*')),
                    limpar_telefone(row.get('WPP/TELEFONE*')),
                    data_nasc,
                    str(row.get('ENDEREÇO COMPLETO*', ''))[:255] if not pd.isna(row.get('ENDEREÇO COMPLETO*')) else None,
                    True
                ))

            # Mapear imóvel -> inquilinos
            imovel_nome = row.get('IMÓVEL LOCADO:')
            if not pd.isna(imovel_nome):
                key = str(imovel_nome).strip()
                if key not in inquilinos_map:
                    inquilinos_map[key] = []
                inquilinos_map[key].append(inq_id)

        print(f"   ✅ {sum(len(v) for v in inquilinos_map.values())} inquilinos importados")

        # ====================
        # 3. IMPORTAR IMÓVEIS
        # ====================
        print("\n📋 3. Importando Imóveis...")
        df_imoveis = pd.read_excel(excel_file, sheet_name='Imóveis')

        imoveis_map = {}  # mapa: nome_imovel -> imovel_id

        for idx, row in df_imoveis.iterrows():
            nome_imovel = row.get('IMÓVEL LOCADO:')
            if pd.isna(nome_imovel):
                continue

            nome_imovel = str(nome_imovel).strip()

            # Pegar proprietário
            prop_id = proprietarios_map.get(nome_imovel)
            if not prop_id:
                print(f"   ⚠️ Proprietário não encontrado para imóvel: {nome_imovel}")
                # Tentar criar um proprietário genérico se não existir
                prop_id = str(uuid.uuid4())
                cur.execute('''
                    INSERT INTO proprietarios (
                        id, tipo_pessoa, nome, cpf_cnpj, email, ativo
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    prop_id,
                    'PF',
                    f'Proprietário - {nome_imovel}',
                    f'999{str(uuid.uuid4().int)[:8]}',  # CPF temporário
                    f'temp_{prop_id}@martinez.temp',
                    True
                ))
                proprietarios_map[nome_imovel] = prop_id

            # Verificar se já existe pelo nome do imóvel
            cur.execute('SELECT id FROM imoveis WHERE endereco_complemento = %s', (nome_imovel,))
            existing = cur.fetchone()

            if existing:
                imovel_id = existing[0]
            else:
                imovel_id = str(uuid.uuid4())

                endereco = str(row.get('CEP - ENDEREÇO COMPLETO', '')).strip()

                # Tentar extrair CEP
                cep_match = re.search(r'(\d{5}-?\d{3})', endereco)
                cep = cep_match.group(1) if cep_match else '74000-000'

                # Valor do aluguel
                valor_aluguel = extrair_valor_brl(row.get('VALOR DO ALUGUEL'))
                if not valor_aluguel:
                    valor_aluguel = 0.00

                cur.execute('''
                    INSERT INTO imoveis (
                        id, proprietario_id, tipo, endereco_cep, endereco_logradouro,
                        endereco_numero, endereco_complemento, endereco_bairro,
                        endereco_cidade, endereco_estado, valor_aluguel, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    imovel_id,
                    prop_id,
                    'Apartamento',
                    cep,
                    endereco[:255] if endereco else 'Goiânia',
                    'S/N',
                    nome_imovel[:100],  # identificação como complemento
                    'Setor Bueno',
                    'Goiânia',
                    'GO',
                    valor_aluguel,
                    'locado'
                ))

            imoveis_map[nome_imovel] = imovel_id

        print(f"   ✅ {len(imoveis_map)} imóveis importados")

        # ====================
        # 4. IMPORTAR CONTRATOS
        # ====================
        print("\n📋 4. Importando Contratos...")
        df_contratos = pd.read_excel(excel_file, sheet_name='Contratos')

        contratos_count = 0

        for idx, row in df_contratos.iterrows():
            nome_imovel = row.get('IMÓVEL LOCADO:')
            if pd.isna(nome_imovel):
                continue

            nome_imovel = str(nome_imovel).strip()

            # Pegar IDs
            imovel_id = imoveis_map.get(nome_imovel)
            inquilinos_ids = inquilinos_map.get(nome_imovel, [])

            if not imovel_id or not inquilinos_ids:
                print(f"   ⚠️ Dados incompletos para contrato: {nome_imovel}")
                continue

            inquilino_principal_id = inquilinos_ids[0]

            # Extrair dados do contrato
            dados_contrato = str(row.get('DADOS DO CONTRATO (VALOR DO ALUGUEL, DATA DE INÍCIO, DURAÇÃO, DATA DE TÉRMINO, DIA DO VENCIMENTO)', ''))

            valor_aluguel = extrair_valor_brl(dados_contrato)
            data_inicio = extrair_data(dados_contrato)

            # Extrair dia de vencimento
            dia_venc_match = re.search(r'TODO DIA (\d{1,2})', dados_contrato)
            dia_vencimento = int(dia_venc_match.group(1)) if dia_venc_match else 5

            # Data fim
            data_fim_str = extrair_data(dados_contrato.split(' - ')[-1] if ' - ' in dados_contrato else '')

            # Garantia
            garantia_texto = str(row.get('GARANTIAS (FIANÇA, CAUÇÃO OU SEGURO-FIANÇA)', '')).lower()
            if 'caucao' in garantia_texto or 'caução' in garantia_texto:
                tipo_garantia = 'caucao'
                valor_caucao = extrair_valor_brl(garantia_texto)
            elif 'fianca' in garantia_texto or 'fiança' in garantia_texto:
                tipo_garantia = 'fianca'
                valor_caucao = None
            elif 'seguro' in garantia_texto:
                tipo_garantia = 'seguro_fianca'
                valor_caucao = None
            else:
                tipo_garantia = 'nenhuma'
                valor_caucao = None

            # Taxa de administração
            admin_value = row.get('VALOR DA ADMINISTRAÇÃO')
            taxa_admin = float(admin_value) if not pd.isna(admin_value) and isinstance(admin_value, (int, float)) else 10.0

            # Verificar se já existe contrato para esse imóvel
            cur.execute('SELECT id FROM contratos WHERE imovel_id = %s', (imovel_id,))
            existing = cur.fetchone()

            if not existing and valor_aluguel and data_inicio:
                contrato_id = str(uuid.uuid4())

                cur.execute('''
                    INSERT INTO contratos (
                        id, imovel_id, inquilino_principal_id, data_inicio, data_fim,
                        valor_aluguel, dia_vencimento, tipo_garantia, valor_caucao,
                        taxa_administracao, repasse_proprietario, observacoes, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    contrato_id,
                    imovel_id,
                    inquilino_principal_id,
                    data_inicio,
                    data_fim_str if data_fim_str else '2026-12-31',
                    valor_aluguel,
                    dia_vencimento,
                    tipo_garantia,
                    valor_caucao,
                    taxa_admin,
                    100.0 - taxa_admin,
                    str(row.get('OBSERVAÇÕES', '')) if not pd.isna(row.get('OBSERVAÇÕES')) else None,
                    'ativo'
                ))

                # Atualizar valor do imóvel
                cur.execute('UPDATE imoveis SET valor_aluguel = %s WHERE id = %s', (valor_aluguel, imovel_id))

                contratos_count += 1

        print(f"   ✅ {contratos_count} contratos importados")

        # Commit
        conn.commit()
        print("\n" + "="*80)
        print("✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!")
        print("="*80)

    except Exception as e:
        print(f"\n❌ Erro durante importação: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
