CREATE TABLE IF NOT EXISTS public.lots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  short_description text,
  description text,
  image_url text,
  initial_bid numeric NOT NULL,
  current_bid numeric DEFAULT 0 NOT NULL,
  bids_count integer DEFAULT 0 NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  status text DEFAULT 'aberto' NOT NULL, -- 'aberto', 'finalizado'
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Índices para otimização
CREATE INDEX lots_ends_at_idx ON public.lots (ends_at);
CREATE INDEX lots_status_idx ON public.lots (status);