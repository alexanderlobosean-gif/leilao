-- Remove políticas conflitantes e duplicadas
DROP POLICY IF EXISTS "Admins can view all lots" ON public.lots;
DROP POLICY IF EXISTS "Admins têm acesso total" ON public.lots;
DROP POLICY IF EXISTS "Permitir leitura de lotes autenticados" ON public.lots;
DROP POLICY IF EXISTS "Permitir leitura de lotes para autenticados" ON public.lots;
DROP POLICY IF EXISTS "Usuários autenticados podem ver lotes" ON public.lots;

-- Política para leitura de lotes (pública)
CREATE POLICY "Permitir leitura de lotes para todos" 
ON public.lots 
FOR SELECT 
USING (true);

-- Política para administradores
CREATE POLICY "Admins têm acesso total" 
ON public.lots 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'user_type' = 'admin'
  )
);

-- Política para usuários autenticados fazerem lances
CREATE POLICY "Usuários autenticados podem dar lances" 
ON public.lots 
FOR UPDATE 
TO authenticated
USING (status = 'aberto')
WITH CHECK (status = 'aberto');

-- Política para administradores gerenciarem lotes
CREATE POLICY "Admins podem gerenciar lotes" 
ON public.lots 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'user_type' = 'admin'
  )
);
