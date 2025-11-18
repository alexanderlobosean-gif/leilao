-- Habilita RLS para a tabela 'documents' (se ainda não estiver habilitado)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela 'documents'
-- Permite que usuários vejam seus próprios documentos
CREATE POLICY "Users can view their own documents." ON documents
  FOR SELECT USING (auth.uid() = user_id);

-- Permite que usuários insiram seus próprios documentos
CREATE POLICY "Users can insert their own documents." ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permite que usuários atualizem seus próprios documentos
CREATE POLICY "Users can update their own documents." ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- Garante que o bucket 'userdocuments' exista e esteja configurado como público.
-- Usa ON CONFLICT para atualizar se o bucket já existir, evitando erro de duplicação.
INSERT INTO storage.buckets (id, name, public)
VALUES ('userdocuments', 'userdocuments', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Adiciona a política de RLS para o storage.objects para permitir leitura pública no bucket 'userdocuments'.
-- Isso é necessário para que as URLs públicas funcionem corretamente.
CREATE POLICY "Allow public read access to userdocuments" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'userdocuments');