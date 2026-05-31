-- =============================================================================
-- BarberOS — Row Level Security (RLS)
-- =============================================================================
-- Modelo de segurança:
--   * `barbearias.user_id` referencia auth.users(id) e é a "raiz" do tenant.
--   * Todas as outras tabelas referenciam `barbearia_id`.
--   * Um usuário só pode ver/alterar registros que pertencem a uma barbearia
--     da qual ele é dono.
--
-- Como aplicar:
--   - Via Supabase CLI:  supabase db push
--   - Via Dashboard:     SQL Editor -> cole este arquivo -> Run
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1) Habilita RLS em todas as tabelas
-- -----------------------------------------------------------------------------
alter table public.barbearias    enable row level security;
alter table public.clientes      enable row level security;
alter table public.funcionarios  enable row level security;
alter table public.servicos      enable row level security;
alter table public.agendamentos  enable row level security;

-- Boa prática: força RLS também para o owner das tabelas, evitando bypass acidental.
alter table public.barbearias    force row level security;
alter table public.clientes      force row level security;
alter table public.funcionarios  force row level security;
alter table public.servicos      force row level security;
alter table public.agendamentos  force row level security;


-- -----------------------------------------------------------------------------
-- 2) Função auxiliar: verifica se o usuário autenticado é dono da barbearia
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER + STABLE permite que o Postgres cacheie o resultado dentro
-- de uma mesma query, melhorando o desempenho das policies.
create or replace function public.user_owns_barbearia(b_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.barbearias
     where id = b_id
       and user_id = auth.uid()
  );
$$;

-- A função só precisa ser executável por usuários autenticados.
revoke all on function public.user_owns_barbearia(uuid) from public;
grant execute on function public.user_owns_barbearia(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- 3) Policies — barbearias
--    Cada usuário só vê/edita as barbearias onde user_id = auth.uid()
-- -----------------------------------------------------------------------------
drop policy if exists "barbearias_select_own"  on public.barbearias;
drop policy if exists "barbearias_insert_own"  on public.barbearias;
drop policy if exists "barbearias_update_own"  on public.barbearias;
drop policy if exists "barbearias_delete_own"  on public.barbearias;

create policy "barbearias_select_own"
  on public.barbearias
  for select
  to authenticated
  using ( user_id = auth.uid() );

create policy "barbearias_insert_own"
  on public.barbearias
  for insert
  to authenticated
  with check ( user_id = auth.uid() );

create policy "barbearias_update_own"
  on public.barbearias
  for update
  to authenticated
  using      ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

create policy "barbearias_delete_own"
  on public.barbearias
  for delete
  to authenticated
  using ( user_id = auth.uid() );


-- -----------------------------------------------------------------------------
-- 4) Policies — clientes
-- -----------------------------------------------------------------------------
drop policy if exists "clientes_select_own"  on public.clientes;
drop policy if exists "clientes_insert_own"  on public.clientes;
drop policy if exists "clientes_update_own"  on public.clientes;
drop policy if exists "clientes_delete_own"  on public.clientes;

create policy "clientes_select_own"
  on public.clientes
  for select
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );

create policy "clientes_insert_own"
  on public.clientes
  for insert
  to authenticated
  with check ( public.user_owns_barbearia(barbearia_id) );

create policy "clientes_update_own"
  on public.clientes
  for update
  to authenticated
  using      ( public.user_owns_barbearia(barbearia_id) )
  with check ( public.user_owns_barbearia(barbearia_id) );

create policy "clientes_delete_own"
  on public.clientes
  for delete
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );


-- -----------------------------------------------------------------------------
-- 5) Policies — funcionarios
-- -----------------------------------------------------------------------------
drop policy if exists "funcionarios_select_own"  on public.funcionarios;
drop policy if exists "funcionarios_insert_own"  on public.funcionarios;
drop policy if exists "funcionarios_update_own"  on public.funcionarios;
drop policy if exists "funcionarios_delete_own"  on public.funcionarios;

create policy "funcionarios_select_own"
  on public.funcionarios
  for select
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );

create policy "funcionarios_insert_own"
  on public.funcionarios
  for insert
  to authenticated
  with check ( public.user_owns_barbearia(barbearia_id) );

create policy "funcionarios_update_own"
  on public.funcionarios
  for update
  to authenticated
  using      ( public.user_owns_barbearia(barbearia_id) )
  with check ( public.user_owns_barbearia(barbearia_id) );

create policy "funcionarios_delete_own"
  on public.funcionarios
  for delete
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );


-- -----------------------------------------------------------------------------
-- 6) Policies — servicos
-- -----------------------------------------------------------------------------
drop policy if exists "servicos_select_own"  on public.servicos;
drop policy if exists "servicos_insert_own"  on public.servicos;
drop policy if exists "servicos_update_own"  on public.servicos;
drop policy if exists "servicos_delete_own"  on public.servicos;

create policy "servicos_select_own"
  on public.servicos
  for select
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );

create policy "servicos_insert_own"
  on public.servicos
  for insert
  to authenticated
  with check ( public.user_owns_barbearia(barbearia_id) );

create policy "servicos_update_own"
  on public.servicos
  for update
  to authenticated
  using      ( public.user_owns_barbearia(barbearia_id) )
  with check ( public.user_owns_barbearia(barbearia_id) );

create policy "servicos_delete_own"
  on public.servicos
  for delete
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );


-- -----------------------------------------------------------------------------
-- 7) Policies — agendamentos
--    Além de validar o tenant pelo barbearia_id, garantimos que cliente,
--    funcionario e servico referenciados pertencem à mesma barbearia.
-- -----------------------------------------------------------------------------
drop policy if exists "agendamentos_select_own"  on public.agendamentos;
drop policy if exists "agendamentos_insert_own"  on public.agendamentos;
drop policy if exists "agendamentos_update_own"  on public.agendamentos;
drop policy if exists "agendamentos_delete_own"  on public.agendamentos;

create policy "agendamentos_select_own"
  on public.agendamentos
  for select
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );

create policy "agendamentos_insert_own"
  on public.agendamentos
  for insert
  to authenticated
  with check (
    public.user_owns_barbearia(barbearia_id)
    and exists (
      select 1 from public.clientes
       where id = cliente_id and barbearia_id = agendamentos.barbearia_id
    )
    and exists (
      select 1 from public.funcionarios
       where id = funcionario_id and barbearia_id = agendamentos.barbearia_id
    )
    and exists (
      select 1 from public.servicos
       where id = servico_id and barbearia_id = agendamentos.barbearia_id
    )
  );

create policy "agendamentos_update_own"
  on public.agendamentos
  for update
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) )
  with check (
    public.user_owns_barbearia(barbearia_id)
    and exists (
      select 1 from public.clientes
       where id = cliente_id and barbearia_id = agendamentos.barbearia_id
    )
    and exists (
      select 1 from public.funcionarios
       where id = funcionario_id and barbearia_id = agendamentos.barbearia_id
    )
    and exists (
      select 1 from public.servicos
       where id = servico_id and barbearia_id = agendamentos.barbearia_id
    )
  );

create policy "agendamentos_delete_own"
  on public.agendamentos
  for delete
  to authenticated
  using ( public.user_owns_barbearia(barbearia_id) );


-- -----------------------------------------------------------------------------
-- 8) Índices recomendados (aceleram tanto as queries quanto as policies)
-- -----------------------------------------------------------------------------
create index if not exists barbearias_user_id_idx          on public.barbearias    (user_id);
create index if not exists clientes_barbearia_id_idx       on public.clientes      (barbearia_id);
create index if not exists funcionarios_barbearia_id_idx   on public.funcionarios  (barbearia_id);
create index if not exists servicos_barbearia_id_idx       on public.servicos      (barbearia_id);
create index if not exists agendamentos_barbearia_id_idx   on public.agendamentos  (barbearia_id);
create index if not exists agendamentos_data_hora_idx      on public.agendamentos  (barbearia_id, data_hora);
