-- Desativa o RLS temporariamente
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Remove todas as políticas existentes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT polname 
        FROM pg_policies 
        WHERE tablename = 'documents' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.documents', policy_record.polname);
    END LOOP;
END $$;

-- Cria políticas limpas e otimizadas
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

-- Política para administradores (opcional)
CREATE POLICY "Administradores têm acesso total"
ON public.documents
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'user_type' = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'user_type' = 'admin'
    )
);

-- Reativa o RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
