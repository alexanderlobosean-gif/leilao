-- Desativa o RLS para a tabela lots temporariamente
ALTER TABLE public.lots DISABLE ROW LEVEL SECURITY;

-- Cria uma política de segurança temporária que permite leitura para todos
CREATE POLICY "Permitir leitura pública de lotes"
ON public.lots
FOR SELECT
USING (true);

-- Garante que as permissões estão corretas
GRANT SELECT ON public.lots TO anon, authenticated;
