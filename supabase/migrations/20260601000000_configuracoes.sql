-- =============================================================================
-- BarberOS — Migração: Configurações da barbearia
-- =============================================================================

-- 1) Adiciona colunas na tabela barbearias
ALTER TABLE public.barbearias
  ADD COLUMN IF NOT EXISTS slogan text,
  ADD COLUMN IF NOT EXISTS endereco_completo text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS hora_abertura time DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS hora_fechamento time DEFAULT '19:00',
  ADD COLUMN IF NOT EXISTS intervalo_minutos int DEFAULT 30;

-- 2) Cria bucket público "logos" no Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3) Política RLS para o bucket logos: qualquer um pode ler (público)
DROP POLICY IF EXISTS "logos_select_public" ON storage.objects;
CREATE POLICY "logos_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'logos');

-- 4) Política RLS para upload: usuário só pode inserir no path da própria barbearia
-- Usa LIKE para verificar se o path começa com {barbearia_id}/
DROP POLICY IF EXISTS "logos_insert_own" ON storage.objects;
CREATE POLICY "logos_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND EXISTS (
      SELECT 1 FROM public.barbearias
       WHERE user_id = auth.uid()
         AND name LIKE id::text || '/%'
    )
  );

-- 5) Política RLS para update
DROP POLICY IF EXISTS "logos_update_own" ON storage.objects;
CREATE POLICY "logos_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND EXISTS (
      SELECT 1 FROM public.barbearias
       WHERE user_id = auth.uid()
         AND name LIKE id::text || '/%'
    )
  );

-- 6) Política RLS para delete
DROP POLICY IF EXISTS "logos_delete_own" ON storage.objects;
CREATE POLICY "logos_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND EXISTS (
      SELECT 1 FROM public.barbearias
       WHERE user_id = auth.uid()
         AND name LIKE id::text || '/%'
    )
  );
