-- =============================================================================
-- BarberOS — Verificação de RLS
-- =============================================================================
-- Rode no SQL Editor depois de aplicar a migration `20260531000000_enable_rls.sql`
-- para confirmar que tudo está no lugar.
-- =============================================================================

-- 1) Todas as tabelas devem ter RLS habilitado (rowsecurity = true)
select schemaname,
       tablename,
       rowsecurity   as rls_enabled,
       forcerowsecurity as rls_forced
  from pg_tables
 where schemaname = 'public'
   and tablename in ('barbearias','clientes','funcionarios','servicos','agendamentos')
 order by tablename;

-- 2) Lista todas as policies criadas (deve haver 4 por tabela: select/insert/update/delete)
select schemaname,
       tablename,
       policyname,
       cmd       as command,
       roles
  from pg_policies
 where schemaname = 'public'
   and tablename in ('barbearias','clientes','funcionarios','servicos','agendamentos')
 order by tablename, cmd;

-- 3) Confirma que a função auxiliar existe
select n.nspname as schema,
       p.proname as function,
       pg_get_function_identity_arguments(p.oid) as args,
       p.prosecdef as security_definer
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname = 'user_owns_barbearia';

-- 4) Confirma os índices
select schemaname, tablename, indexname
  from pg_indexes
 where schemaname = 'public'
   and tablename in ('barbearias','clientes','funcionarios','servicos','agendamentos')
   and indexname like '%_idx'
 order by tablename, indexname;
