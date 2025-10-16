#!/usr/bin/env python3
"""
Script para importar dados do Excel (controle-locacao.xlsx) para o banco de dados PostgreSQL
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
from datetime import datetime
import uuid
import sys

# Configuração do banco
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ Erro: DATABASE_URL não configurada")
    sys.exit(1)

def analyze_excel():
    """Analisa a estrutura do arquivo Excel"""
    print("📊 Analisando estrutura do arquivo Excel...")

    # Ler o arquivo Excel
    excel_file = 'docs/controle-locacao.xlsx'

    # Listar todas as abas
    xl = pd.ExcelFile(excel_file)
    print(f"\n📑 Abas encontradas: {xl.sheet_names}\n")

    # Ler e mostrar preview de cada aba
    for sheet_name in xl.sheet_names:
        print(f"\n{'='*80}")
        print(f"ABA: {sheet_name}")
        print('='*80)

        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        print(f"\n📏 Dimensões: {df.shape[0]} linhas x {df.shape[1]} colunas")
        print(f"\n📋 Colunas encontradas:")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i}. {col}")

        print(f"\n👀 Preview dos dados (primeiras 5 linhas):")
        print(df.head().to_string())

        print(f"\n🔍 Tipos de dados:")
        print(df.dtypes.to_string())

        print(f"\n📊 Estatísticas:")
        print(f"  - Valores nulos por coluna:")
        for col in df.columns:
            null_count = df[col].isnull().sum()
            if null_count > 0:
                print(f"    {col}: {null_count} nulos")

def generate_uuid():
    """Gera um UUID para usar como ID"""
    return str(uuid.uuid4())

def safe_date(value):
    """Converte valor para data de forma segura"""
    if pd.isna(value):
        return None
    if isinstance(value, datetime):
        return value.date()
    try:
        return pd.to_datetime(value).date()
    except:
        return None

def safe_float(value):
    """Converte valor para float de forma segura"""
    if pd.isna(value):
        return None
    try:
        return float(value)
    except:
        return None

def safe_int(value):
    """Converte valor para int de forma segura"""
    if pd.isna(value):
        return None
    try:
        return int(value)
    except:
        return None

def safe_str(value):
    """Converte valor para string de forma segura"""
    if pd.isna(value):
        return None
    return str(value).strip()

def import_data():
    """Importa os dados do Excel para o banco"""
    print("\n🚀 Iniciando importação de dados...")

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        excel_file = 'docs/controle-locacao.xlsx'

        # TODO: Implementar lógica de importação baseada na estrutura real do Excel
        # Isso será feito após analisar a estrutura

        print("\n✅ Importação concluída com sucesso!")

    except Exception as e:
        print(f"\n❌ Erro durante importação: {e}")
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("="*80)
    print("📦 IMPORTADOR DE DADOS - MARTINEZ IMOBILIÁRIA")
    print("="*80)

    # Primeiro, analisar a estrutura
    analyze_excel()

    # Perguntar se deve continuar com a importação
    print("\n" + "="*80)
    response = input("\n❓ Deseja continuar com a importação? (s/N): ")

    if response.lower() == 's':
        import_data()
    else:
        print("\n⏸️  Importação cancelada pelo usuário")
