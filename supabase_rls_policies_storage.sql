-- Permite que qualquer pessoa (anon) leia arquivos no bucket 'userdocuments'
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (true);