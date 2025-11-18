CREATE TABLE IF NOT EXISTS public.bids (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lot_id uuid NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  lot_title text, -- Adicionado para facilitar a exibição
  bid_amount numeric NOT NULL,
  status text DEFAULT 'Pendente' NOT NULL, -- 'Vencedor', 'Superado', 'Perdedor', 'Pendente'
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Índices para otimização
CREATE INDEX bids_user_id_idx ON public.bids (user_id);
CREATE INDEX bids_lot_id_idx ON public.bids (lot_id);