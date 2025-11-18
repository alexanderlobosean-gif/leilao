-- Desativa o RLS temporariamente
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Remove políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios documentos" ON public.documents;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios documentos" ON public.documents;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios documentos" ON public.documents;
DROP POLICY IF EXISTS "Administradores têm acesso total" ON public.documents;

-- Cria políticas limpas
CREATE POLICY "Usuários podem ver seus próprios documentos"
ON public.documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios documentos"
ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios documentos"
ON public.documents
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Reativa o RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
