-- Habilitar RLS para a tabela 'lots'
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários (anon e autenticados) vejam os lotes
DROP POLICY IF EXISTS "Allow public read access to lots" ON public.lots;
CREATE POLICY "Allow public read access to lots" ON public.lots
  FOR SELECT USING (true);

-- NOVA POLÍTICA: Permitir que usuários autenticados atualizem o lance e a contagem de lances em lotes abertos
DROP POLICY IF EXISTS "Authenticated users can update lots for bidding" ON public.lots;
CREATE POLICY "Authenticated users can update lots for bidding" ON public.lots
  FOR UPDATE TO authenticated
  USING (status = 'aberto') -- Permite a atualização apenas se o lote estiver aberto
  WITH CHECK (status = 'aberto'); -- Garante que o status permaneça aberto (ou seja, não pode ser alterado para 'finalizado' por um lance)

-- Habilitar RLS para a tabela 'bids'
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados insiram lances
DROP POLICY IF EXISTS "Authenticated users can insert bids" ON public.bids;
CREATE POLICY "Authenticated users can insert bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que usuários autenticados vejam seus próprios lances
DROP POLICY IF EXISTS "Authenticated users can view their own bids" ON public.bids;
CREATE POLICY "Authenticated users can view their own bids" ON public.bids
  FOR SELECT USING (auth.uid() = user_id);

-- Habilitar RLS para a tabela 'qualifications'
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados insiram solicitações de habilitação
DROP POLICY IF EXISTS "Authenticated users can insert qualifications" ON public.qualifications;
CREATE POLICY "Authenticated users can insert qualifications" ON public.qualifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que usuários autenticados vejam suas próprias habilitações
DROP POLICY IF EXISTS "Authenticated users can view their own qualifications" ON public.qualifications;
CREATE POLICY "Authenticated users can view their own qualifications" ON public.qualifications
  FOR SELECT USING (auth.uid() = user_id);

-- Habilitar RLS para a tabela 'documents'
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados insiram documentos
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;
CREATE POLICY "Authenticated users can insert documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que usuários autenticados vejam seus próprios documentos
DROP POLICY IF EXISTS "Allow authenticated users to view their own documents" ON public.documents;
CREATE POLICY "Allow authenticated users to view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários autenticados atualizem seus próprios documentos
DROP POLICY IF EXISTS "Authenticated users can update their own documents" ON public.documents;
CREATE POLICY "Authenticated users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);