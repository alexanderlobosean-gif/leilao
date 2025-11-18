-- Atualiza o user_metadata para um usuário específico na tabela auth.users
UPDATE auth.users
SET
  raw_user_meta_data = raw_user_meta_data || '{"user_type": "admin"}'::jsonb
WHERE
  email = 'seu_email_de_admin@exemplo.com'; -- Substitua pelo e-mail do usuário que você quer tornar admin
-- OU, se preferir usar o ID do usuário:
-- WHERE
--   id = 'SEU_USER_ID_AQUI'; -- Substitua pelo ID do usuário (UUID)