# MARTINEZIMOB

Sistema de Gestão Imobiliária desenvolvido com Next.js 15, TypeScript e PostgreSQL.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **PostgreSQL (Neon)** - Banco de dados
- **Better Auth** - Sistema de autenticação
- **shadcn/ui** - Componentes UI
- **TanStack Table** - Tabelas avançadas
- **Recharts** - Gráficos e visualizações

## 📋 Funcionalidades

- **Dashboard** - Visão geral com métricas financeiras e gráficos
- **Proprietários** - Cadastro e gestão de proprietários (PF/PJ)
- **Inquilinos** - Cadastro e gestão de inquilinos
- **Imóveis** - Gestão de imóveis para locação
- **Contratos** - Criação e acompanhamento de contratos
- **Pagamentos** - Controle de pagamentos e recebimentos
- **Documentos** - Upload e gestão de documentos

## 🔐 Acesso

**Email:** admin@martinez.com
**Senha:** admin123

## 🛠️ Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Rodar migrações do banco
pnpm db:migrate

# Iniciar servidor de desenvolvimento
pnpm dev
```

## 📦 Scripts

```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build de produção
pnpm start        # Servidor de produção
pnpm type-check   # Verificar tipos TypeScript
```

## 🏗️ Estrutura

```
├── app/              # App Router (Next.js 15)
├── components/       # Componentes React
├── lib/              # Utilitários e actions
├── scripts/          # Scripts SQL e seeds
└── public/           # Arquivos estáticos
```

## 📄 Licença

Desenvolvido por Martinez Imobiliária
