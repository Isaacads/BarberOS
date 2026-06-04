-- Tabela de controle de assinaturas/planos
CREATE TABLE IF NOT EXISTS assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE,
  plano text NOT NULL DEFAULT 'trial', -- trial, mensal, anual
  status text NOT NULL DEFAULT 'ativo', -- ativo, expirado, cancelado
  trial_inicio timestamptz DEFAULT now(),
  trial_fim timestamptz DEFAULT (now() + interval '7 days'),
  pagamento_inicio timestamptz,
  pagamento_fim timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice único por barbearia
CREATE UNIQUE INDEX IF NOT EXISTS idx_assinaturas_barbearia_id ON assinaturas(barbearia_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_assinaturas_updated_at ON assinaturas;
CREATE TRIGGER update_assinaturas_updated_at
  BEFORE UPDATE ON assinaturas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: usuários só podem ver/editar sua própria assinatura (via barbearia)
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ver sua assinatura"
  ON assinaturas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM barbearias b
      WHERE b.id = assinaturas.barbearia_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode inserir sua assinatura"
  ON assinaturas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM barbearias b
      WHERE b.id = assinaturas.barbearia_id
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode atualizar sua assinatura"
  ON assinaturas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM barbearias b
      WHERE b.id = assinaturas.barbearia_id
      AND b.user_id = auth.uid()
    )
  );
