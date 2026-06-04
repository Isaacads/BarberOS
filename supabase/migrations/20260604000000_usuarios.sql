-- Tabela de usuários do sistema (barbeiros/staff vinculados à barbearia)
-- Cada usuário que faz login vincula a barbearia_id (multi-tenant)
-- perfil: 'admin' (dono, gerencia tudo incluindo usuários) ou 'staff' (só agenda/atende)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbearia_id uuid NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  perfil text NOT NULL DEFAULT 'staff', -- 'admin' | 'staff'
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_barbearia_id ON usuarios(barbearia_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Unicidade de e-mail por barbearia
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_barbearia_email ON usuarios(barbearia_id, email);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS DESABILITADO: controle de acesso é aplicado via middleware + server actions.
-- O RLS self-join na tabela usuarios gera incapacidade de criar o primeiro registro
-- (catch-22: precise existir para poder inserir).
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário pode ver usuários da sua barbearia" ON usuarios;
DROP POLICY IF EXISTS "Usuário admin pode inserir usuários na sua barbearia" ON usuarios;
DROP POLICY IF EXISTS "Usuário admin pode atualizar usuários da sua barbearia" ON usuarios;
DROP POLICY IF EXISTS "Usuário admin pode deletar usuários da sua barbearia" ON usuarios;
