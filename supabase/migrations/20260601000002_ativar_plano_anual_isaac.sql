-- Ativar plano anual para isaacads2015@gmail.com
UPDATE assinaturas
SET 
  plano = 'anual',
  status = 'ativo',
  pagamento_inicio = now(),
  pagamento_fim = now() + interval '1 year',
  updated_at = now()
WHERE barbearia_id = (
  SELECT b.id 
  FROM barbearias b
  JOIN auth.users u ON u.id = b.user_id
  WHERE u.email = 'isaacads2015@gmail.com'
);
