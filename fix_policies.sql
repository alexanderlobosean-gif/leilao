-- Desativa o RLS temporariamente
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Remove políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seus documentos" ON public.documents;
DROP POLICY IF EXISTS "Permitir inserção de documentos" ON public.documents;
DROP POLICY IF EXISTS "Permitir atualização de documentos" ON public.documents;

-- Cria políticas seguras
CREATE POLICY "Usuários podem ver seus documentos"
ON public.documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserção de documentos"
ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir atualização de documentos"
ON public.documents
FOR UPDATE
USING (auth.uid() = user_id);

-- Reativa o RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
