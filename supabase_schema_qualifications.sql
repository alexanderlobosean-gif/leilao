CREATE TABLE IF NOT EXISTS public.qualifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text DEFAULT 'Pendente' NOT NULL, -- 'Pendente', 'Aprovado', 'Rejeitado'
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Índices para otimização
CREATE INDEX qualifications_user_id_idx ON public.qualifications (user_id);