# Autenticação - Better Auth

## Configuração Completa ✅

A autenticação foi implementada com sucesso usando [Better Auth](https://www.better-auth.com/).

### O que foi implementado:

1. **Configuração do Better Auth**
   - Arquivo de configuração: [lib/auth.ts](lib/auth.ts)
   - Cliente de autenticação: [lib/auth-client.ts](lib/auth-client.ts)
   - API Route: [app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts)

2. **Banco de Dados**
   - Tabelas criadas: `auth_user`, `auth_session`, `auth_account`, `auth_verification`
   - Script de migração: [scripts/004_auth_tables.sql](scripts/004_auth_tables.sql)

3. **Interface de Usuário**
   - Página de login: [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx)
   - Formulário de login: [components/auth/login-form.tsx](components/auth/login-form.tsx)
   - Menu de usuário: [components/layout/user-menu.tsx](components/layout/user-menu.tsx)

4. **Proteção de Rotas**
   - Middleware configurado: [middleware.ts](middleware.ts)
   - Todas as rotas protegidas exceto `/login` e `/api/auth/*`

5. **Usuário Admin**
   - Script de criação: [scripts/create-admin.ts](scripts/create-admin.ts)
   - Credenciais criadas ✅

## Credenciais de Acesso

```
Email: admin@martinez.com.br
Senha: admin123
```

**⚠️ IMPORTANTE: Altere a senha após o primeiro login!**

## Como Usar

### 1. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

### 2. Acessar a aplicação

Abra [http://localhost:3000](http://localhost:3000) no navegador. Você será redirecionado para a página de login.

### 3. Fazer login

Use as credenciais acima para acessar o sistema.

### 4. Criar novos usuários (futuramente)

Para criar novos usuários, você pode:
- Criar uma página de cadastro
- Ou usar o script `create-admin.ts` como base para criar novos usuários via CLI

## Recursos Implementados

- ✅ Login com email e senha
- ✅ Proteção automática de rotas
- ✅ Sessão persistente (7 dias)
- ✅ Menu de usuário no header
- ✅ Logout funcional
- ✅ Redirecionamento automático após login/logout

## Próximos Passos (Opcional)

1. **Página de Cadastro**: Criar página para novos usuários se registrarem
2. **Recuperação de Senha**: Implementar fluxo de "esqueci minha senha"
3. **Perfil de Usuário**: Página para editar informações do usuário
4. **Permissões/Roles**: Implementar sistema de permissões baseado em roles
5. **OAuth**: Adicionar login com Google, GitHub, etc.

## Estrutura de Arquivos

```
/Users/guilhermeoliveiragomes/Projects/MARTINEZ/
├── lib/
│   ├── auth.ts              # Configuração do Better Auth
│   └── auth-client.ts       # Cliente React do Better Auth
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx       # Layout para páginas de autenticação
│   │   └── login/
│   │       └── page.tsx     # Página de login
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts # API handler do Better Auth
├── components/
│   ├── auth/
│   │   └── login-form.tsx   # Formulário de login
│   └── layout/
│       └── user-menu.tsx    # Menu dropdown do usuário
├── scripts/
│   ├── 004_auth_tables.sql  # Schema do banco de dados
│   └── create-admin.ts      # Script para criar usuário admin
├── middleware.ts             # Proteção de rotas
└── .env                      # Variáveis de ambiente
```

## Troubleshooting

### Problema: Não consigo fazer login

1. Verifique se o banco de dados está rodando
2. Confirme que as tabelas foram criadas corretamente
3. Verifique se o usuário admin foi criado
4. Cheque as variáveis de ambiente no `.env`

### Problema: Redirect loop

1. Limpe os cookies do navegador
2. Verifique se o middleware está configurado corretamente
3. Confirme que a rota `/login` está excluída no middleware

### Problema: Sessão não persiste

1. Verifique se os cookies estão habilitados no navegador
2. Confirme que `BETTER_AUTH_URL` está correto no `.env`
3. Cheque se o domínio está correto

## Documentação do Better Auth

Para mais informações, consulte a [documentação oficial do Better Auth](https://www.better-auth.com/docs).
