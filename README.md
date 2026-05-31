# ✂️ BarberOS

SaaS de gestão para barbearias construído com **Next.js 14 (App Router)**, **Tailwind CSS**, **shadcn/ui** e **Supabase**.

## Stack

- Next.js 14 (App Router, Server Components)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Postgres) via `@supabase/ssr`
- lucide-react (ícones)

## Pré-requisitos

1. Node.js 18.17+ instalado
2. Um projeto Supabase com as seguintes tabelas já configuradas:
   - `barbearias (id, user_id, nome, telefone, endereco, created_at)`
   - `clientes (id, barbearia_id, nome, telefone, email, observacoes, created_at)`
   - `funcionarios (id, barbearia_id, nome, telefone, ativo, dias_trabalho int[], hora_inicio time, hora_fim time, created_at)`
   - `servicos (id, barbearia_id, nome, descricao, preco, duracao_minutos, ativo, created_at)`
   - `agendamentos (id, barbearia_id, cliente_id, funcionario_id, servico_id, data_hora timestamptz, duracao_minutos, preco, status text, observacoes, created_at)`

> **Row Level Security (RLS)** já está pronto em `supabase/migrations/` — veja a seção [Segurança (RLS)](#segurança-rls).

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse http://localhost:3000

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

## Estrutura

```
app/
├── (auth)/
│   ├── layout.tsx            # Layout centralizado para auth
│   ├── login/page.tsx        # Tela de login
│   └── registro/page.tsx     # Cadastro de barbearia
├── (dashboard)/
│   ├── layout.tsx            # Layout com sidebar (protegido)
│   ├── dashboard/page.tsx    # Dashboard com totais
│   ├── agendamentos/page.tsx
│   ├── clientes/page.tsx
│   ├── funcionarios/page.tsx
│   └── servicos/page.tsx
├── globals.css
├── layout.tsx                # Root layout
└── page.tsx                  # Redireciona para /login ou /dashboard

components/
├── sidebar.tsx               # Sidebar fixa do dashboard
└── ui/                       # Componentes shadcn/ui (button, input, label, card)

lib/
├── supabase/
│   ├── client.ts             # Cliente Supabase para Client Components
│   ├── server.ts             # Cliente Supabase para Server Components
│   └── middleware.ts         # Helper de auth do middleware
└── utils.ts                  # cn() do shadcn

middleware.ts                 # Protege rotas + redireciona auth

supabase/
├── migrations/
│   └── 20260531000000_enable_rls.sql   # Policies de RLS para multi-tenant
└── verify_rls.sql                       # Script de verificação
```

## Fluxo de autenticação

- **Não autenticado** acessando rota protegida → redireciona para `/login`
- **Autenticado** acessando `/login` ou `/registro` → redireciona para `/dashboard`
- No registro, é criado o usuário no Supabase Auth e inserida uma linha em `barbearias` com `user_id` + `nome`.

## Segurança (RLS)

O arquivo `supabase/migrations/20260531000000_enable_rls.sql` configura **Row Level Security** em todas as tabelas, garantindo o isolamento por barbearia (multi-tenant):

- `barbearias` → cada usuário só vê/edita registros onde `user_id = auth.uid()`
- `clientes`, `funcionarios`, `servicos`, `agendamentos` → restringidos pela função `public.user_owns_barbearia(barbearia_id)`, que valida se o `barbearia_id` pertence ao usuário autenticado
- Em `agendamentos`, ao inserir/atualizar, também é validado que `cliente_id`, `funcionario_id` e `servico_id` pertencem à mesma barbearia
- Cria índices nas colunas `user_id` / `barbearia_id` para performance

### Aplicar via Supabase CLI

```bash
# requer Supabase CLI instalado e projeto vinculado (supabase link)
supabase db push
```

### Aplicar via Dashboard

1. Abra o projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor → New query**
3. Cole o conteúdo de `supabase/migrations/20260531000000_enable_rls.sql`
4. Clique em **Run**

### Verificar se aplicou corretamente

Rode `supabase/verify_rls.sql` no SQL Editor — ele deve mostrar:

- `rls_enabled = true` em todas as 5 tabelas
- 4 policies por tabela (SELECT, INSERT, UPDATE, DELETE)
- A função `user_owns_barbearia` com `security_definer = true`
- Índices `*_barbearia_id_idx` criados

### Reaplicar / atualizar

A migration é **idempotente** (`drop policy if exists` + `create or replace function` + `create index if not exists`), então pode ser rodada novamente com segurança.

## Deploy na Vercel

### 1. Preparação

Certifique-se de que:
- O arquivo `.env.example` está atualizado com todas as variáveis necessárias
- O `next.config.js` está configurado para produção
- O código está commitado no Git

### 2. Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe o repositório do BarberOS
4. Selecione o framework **Next.js**

### 3. Configurar variáveis de ambiente

Na tela de configuração do projeto, adicione:

| Nome | Valor | Obrigatório |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pqwyfiqkxluevvycebyu.supabase.co` | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Sim |

> **Importante:** Não commit o `.env.local`! A Vercel gerencia as envs separadamente.

### 4. Deploy

Clique em **"Deploy"**. A Vercel vai:
1. Instalar dependências (`npm install`)
2. Rodar o build (`next build`)
3. Fazer deploy automático

### 5. Domínio

Após o deploy, você recebe um domínio `.vercel.app`. Para usar domínio próprio:
1. Vá em **Project Settings → Domains**
2. Adicione seu domínio e siga as instruções de DNS

### 6. Deploy automático

A cada push na branch `main`, a Vercel faz deploy automaticamente. Para desativar:
- Vá em **Project Settings → Git → Ignored Build Step**

## Próximos passos sugeridos

- [x] CRUD completo das entidades (clientes, funcionários, serviços, agendamentos)
- [x] Calendário de agendamentos
- [ ] Confirmação de e-mail / recuperação de senha
- [ ] Relatórios financeiros
- [ ] Notificações por WhatsApp/SMS
