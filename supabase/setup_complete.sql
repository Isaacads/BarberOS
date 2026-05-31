-- =============================================================================
-- BarberOS — Criação de tabelas + RLS completo
-- =============================================================================
-- Execute este script inteiro no SQL Editor do Supabase (uma única vez)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Criação das tabelas
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.barbearias (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  telefone    text,
  endereco    text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clientes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  telefone    text,
  email       text,
  observacoes text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.funcionarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id  uuid NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  nome          text NOT NULL,
  telefone      text,
  ativo         boolean DEFAULT true,
  dias_trabalho integer[] DEFAULT '{}',
  hora_inicio   time,
  hora_fim      time,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.servicos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id     uuid NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  nome             text NOT NULL,
  descricao        text,
  preco            numeric(10,2) DEFAULT 0,
  duracao_minutos  integer DEFAULT 30,
  ativo            boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agendamentos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id     uuid NOT NULL REFERENCES public.barbearias(id) ON DELETE CASCADE,
  cliente_id       uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  funcionario_id   uuid REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  servico_id       uuid REFERENCES public.servicos(id) ON DELETE SET NULL,
  data_hora        timestamptz NOT NULL,
  duracao_minutos  integer,
  preco            numeric(10,2),
  status           text DEFAULT 'pendente',
  observacoes      text,
  created_at       timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2) Habilita RLS em todas as tabelas
-- -----------------------------------------------------------------------------
ALTER TABLE public.barbearias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.barbearias    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clientes      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.servicos      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos  FORCE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3) Função auxiliar para verificar ownership
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_owns_barbearia(b_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.barbearias
     WHERE id = b_id AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.user_owns_barbearia(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.user_owns_barbearia(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 4) Policies — barbearias
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "barbearias_select_own" ON public.barbearias;
DROP POLICY IF EXISTS "barbearias_insert_own" ON public.barbearias;
DROP POLICY IF EXISTS "barbearias_update_own" ON public.barbearias;
DROP POLICY IF EXISTS "barbearias_delete_own" ON public.barbearias;

CREATE POLICY "barbearias_select_own"
  ON public.barbearias FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "barbearias_insert_own"
  ON public.barbearias FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "barbearias_update_own"
  ON public.barbearias FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "barbearias_delete_own"
  ON public.barbearias FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5) Policies — clientes
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "clientes_select_own" ON public.clientes;
DROP POLICY IF EXISTS "clientes_insert_own" ON public.clientes;
DROP POLICY IF EXISTS "clientes_update_own" ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete_own" ON public.clientes;

CREATE POLICY "clientes_select_own"
  ON public.clientes FOR SELECT TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "clientes_insert_own"
  ON public.clientes FOR INSERT TO authenticated
  WITH CHECK (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "clientes_update_own"
  ON public.clientes FOR UPDATE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id))
  WITH CHECK (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "clientes_delete_own"
  ON public.clientes FOR DELETE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

-- -----------------------------------------------------------------------------
-- 6) Policies — funcionarios
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "funcionarios_select_own" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_insert_own" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_update_own" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_delete_own" ON public.funcionarios;

CREATE POLICY "funcionarios_select_own"
  ON public.funcionarios FOR SELECT TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "funcionarios_insert_own"
  ON public.funcionarios FOR INSERT TO authenticated
  WITH CHECK (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "funcionarios_update_own"
  ON public.funcionarios FOR UPDATE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id))
  WITH CHECK (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "funcionarios_delete_own"
  ON public.funcionarios FOR DELETE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

-- -----------------------------------------------------------------------------
-- 7) Policies — servicos
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "servicos_select_own" ON public.servicos;
DROP POLICY IF EXISTS "servicos_insert_own" ON public.servicos;
DROP POLICY IF EXISTS "servicos_update_own" ON public.servicos;
DROP POLICY IF EXISTS "servicos_delete_own" ON public.servicos;

CREATE POLICY "servicos_select_own"
  ON public.servicos FOR SELECT TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "servicos_insert_own"
  ON public.servicos FOR INSERT TO authenticated
  WITH CHECK (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "servicos_update_own"
  ON public.servicos FOR UPDATE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id))
  WITH CHECK (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "servicos_delete_own"
  ON public.servicos FOR DELETE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

-- -----------------------------------------------------------------------------
-- 8) Policies — agendamentos
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "agendamentos_select_own" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_insert_own" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_update_own" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_delete_own" ON public.agendamentos;

CREATE POLICY "agendamentos_select_own"
  ON public.agendamentos FOR SELECT TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

CREATE POLICY "agendamentos_insert_own"
  ON public.agendamentos FOR INSERT TO authenticated
  WITH CHECK (
    public.user_owns_barbearia(barbearia_id)
    AND EXISTS (SELECT 1 FROM public.clientes WHERE id = cliente_id AND barbearia_id = agendamentos.barbearia_id)
    AND EXISTS (SELECT 1 FROM public.funcionarios WHERE id = funcionario_id AND barbearia_id = agendamentos.barbearia_id)
    AND EXISTS (SELECT 1 FROM public.servicos WHERE id = servico_id AND barbearia_id = agendamentos.barbearia_id)
  );

CREATE POLICY "agendamentos_update_own"
  ON public.agendamentos FOR UPDATE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id))
  WITH CHECK (
    public.user_owns_barbearia(barbearia_id)
    AND EXISTS (SELECT 1 FROM public.clientes WHERE id = cliente_id AND barbearia_id = agendamentos.barbearia_id)
    AND EXISTS (SELECT 1 FROM public.funcionarios WHERE id = funcionario_id AND barbearia_id = agendamentos.barbearia_id)
    AND EXISTS (SELECT 1 FROM public.servicos WHERE id = servico_id AND barbearia_id = agendamentos.barbearia_id)
  );

CREATE POLICY "agendamentos_delete_own"
  ON public.agendamentos FOR DELETE TO authenticated
  USING (public.user_owns_barbearia(barbearia_id));

-- -----------------------------------------------------------------------------
-- 9) Índices recomendados
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS barbearias_user_id_idx ON public.barbearias(user_id);
CREATE INDEX IF NOT EXISTS clientes_barbearia_id_idx ON public.clientes(barbearia_id);
CREATE INDEX IF NOT EXISTS funcionarios_barbearia_id_idx ON public.funcionarios(barbearia_id);
CREATE INDEX IF NOT EXISTS servicos_barbearia_id_idx ON public.servicos(barbearia_id);
CREATE INDEX IF NOT EXISTS agendamentos_barbearia_id_idx ON public.agendamentos(barbearia_id);
CREATE INDEX IF NOT EXISTS agendamentos_data_hora_idx ON public.agendamentos(barbearia_id, data_hora);
