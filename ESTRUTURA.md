# Estrutura do Projeto - Layouts Separados

## Arquitetura de Layouts

O projeto foi organizado usando **Route Groups** do Next.js para separar layouts diferentes:

```
app/
├── layout.tsx                    # Layout ROOT (apenas HTML + Toaster)
├── (auth)/                       # Grupo de rotas de autenticação
│   ├── layout.tsx               # Layout limpo para auth
│   └── login/
│       └── page.tsx             # Página de login
├── (dashboard)/                 # Grupo de rotas do dashboard
│   ├── layout.tsx              # Layout com Sidebar + Header
│   ├── page.tsx                # Dashboard principal (/)
│   ├── proprietarios/
│   ├── inquilinos/
│   ├── imoveis/
│   ├── contratos/
│   ├── pagamentos/
│   ├── relatorios/
│   ├── documentos/
│   └── interacoes/
└── api/
    └── auth/[...all]/          # API do Better Auth
```

## Como Funciona

### 1. Layout Root ([app/layout.tsx](app/layout.tsx))
- **Responsabilidade**: Apenas HTML base e configurações globais
- **Não inclui**: Sidebar, Header ou qualquer UI específica
- **Aplica-se a**: Todas as páginas da aplicação
- **Componentes**: Apenas `<Toaster />` global

```tsx
<html>
  <body>
    {children}  {/* Renderiza o layout filho */}
    <Toaster />
  </body>
</html>
```

### 2. Auth Layout ([app/(auth)/layout.tsx](app/(auth)/layout.tsx))
- **Responsabilidade**: Layout limpo para páginas de autenticação
- **Inclui**: Container centralizado simples
- **Aplica-se a**: `/login`, futuramente `/register`, `/forgot-password`, etc.
- **Características**: Sem sidebar, sem header

```tsx
<div className="min-h-screen flex items-center justify-center">
  {children}  {/* Página de login */}
</div>
```

### 3. Dashboard Layout ([app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx))
- **Responsabilidade**: Layout completo com navegação
- **Inclui**: Sidebar + Header
- **Aplica-se a**: Todas as páginas do sistema (dashboard, proprietários, etc.)
- **Características**: Layout fixo com sidebar lateral

```tsx
<div className="flex min-h-screen">
  <Sidebar />  {/* Renderizada 1x */}
  <div className="flex-1 ml-64">
    <Header />  {/* Renderizada 1x */}
    <main>
      {children}  {/* Conteúdo da página específica */}
    </main>
  </div>
</div>
```

## Vantagens desta Estrutura

### ✅ Desempenho
- **Sidebar e Header renderizados apenas 1 vez**
- Navegação entre páginas do dashboard não re-renderiza a navegação
- Apenas o conteúdo da página é atualizado

### ✅ Separação de Contextos
- Páginas de autenticação têm layout próprio e limpo
- Páginas do dashboard compartilham navegação
- Fácil adicionar novos grupos (ex: `(public)`, `(admin)`)

### ✅ Manutenibilidade
- Mudanças na sidebar afetam apenas o dashboard
- Fácil adicionar novas páginas em cada contexto
- Layout de autenticação independente

### ✅ Performance de Navegação
- **Client-side navigation** entre páginas do dashboard
- Transições instantâneas (sem reload)
- Sidebar permanece interativa

## Rotas e URLs

### Rotas de Autenticação
```
/login                  → (auth)/login/page.tsx
```

### Rotas do Dashboard
```
/                       → (dashboard)/page.tsx
/proprietarios          → (dashboard)/proprietarios/page.tsx
/inquilinos             → (dashboard)/inquilinos/page.tsx
/imoveis                → (dashboard)/imoveis/page.tsx
/contratos              → (dashboard)/contratos/page.tsx
/pagamentos             → (dashboard)/pagamentos/page.tsx
/relatorios             → (dashboard)/relatorios/page.tsx
/documentos             → (dashboard)/documentos/page.tsx
/interacoes             → (dashboard)/interacoes/page.tsx
```

> **Nota**: Os parênteses em `(auth)` e `(dashboard)` não aparecem na URL. São apenas para organização interna.

## Fluxo de Autenticação

1. **Usuário não autenticado acessa `/`**
   - Middleware detecta ausência de sessão
   - Redireciona para `/login`
   - Layout `(auth)` é aplicado (sem sidebar)

2. **Usuário faz login**
   - Better Auth cria sessão
   - Redireciona para `/`
   - Layout `(dashboard)` é aplicado (com sidebar)

3. **Navegação interna**
   - Cliente navega de `/` para `/proprietarios`
   - Sidebar e Header **não re-renderizam**
   - Apenas conteúdo da página muda

## Como Adicionar Novas Páginas

### Nova Página no Dashboard
```bash
# Criar dentro de (dashboard)
mkdir app/(dashboard)/nova-pagina
touch app/(dashboard)/nova-pagina/page.tsx
```

A página automaticamente terá Sidebar + Header!

### Nova Página de Autenticação
```bash
# Criar dentro de (auth)
mkdir app/(auth)/register
touch app/(auth)/register/page.tsx
```

A página automaticamente terá layout limpo!

### Novo Grupo de Layout
```bash
# Criar novo grupo (ex: público)
mkdir app/(public)
touch app/(public)/layout.tsx
mkdir app/(public)/sobre
touch app/(public)/sobre/page.tsx
```

## Hierarquia de Layouts

```
Root Layout (HTML base)
│
├─── (auth) Layout (limpo)
│    └─── /login
│
└─── (dashboard) Layout (Sidebar + Header)
     ├─── /
     ├─── /proprietarios
     ├─── /inquilinos
     └─── ... outras páginas
```

## Proteção de Rotas

O [middleware.ts](middleware.ts) protege todas as rotas exceto:
- `/login` (permitido sem autenticação)
- `/api/auth/*` (API do Better Auth)
- Assets (`/_next/*`, `/martinez-logo*`)

```typescript
// Usuário sem sessão tentando acessar qualquer página
→ Redirecionado para /login

// Usuário com sessão acessando /login
→ Permitido (pode fazer logout e login novamente)
```

## Resumo Técnico

| Aspecto | Valor |
|---------|-------|
| **Padrão de Layout** | Nested Layouts + Route Groups |
| **Re-renderização** | Apenas conteúdo da página |
| **Navegação** | Client-side (instantânea) |
| **Autenticação** | Middleware + Better Auth |
| **Proteção** | Todas rotas exceto `/login` |

Esta estrutura segue as **melhores práticas do Next.js App Router** e garante performance máxima! 🚀
