-- Cria a função que retorna os lotes públicos
CREATE OR REPLACE FUNCTION public.get_public_lots()
RETURNS TABLE (
  id uuid,
  title text,
  short_description text,
  description text,
  image_url text,
  initial_bid numeric,
  current_bid numeric,
  bids_count integer,
  ends_at timestamptz,
  status text,
  created_at timestamptz
) 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT 
    id,
    title,
    short_description,
    description,
    image_url,
    initial_bid,
    current_bid,
    bids_count,
    ends_at,
    status,
    created_at
  FROM public.lots
  ORDER BY created_at DESC;
$$;

-- Permite que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION public.get_public_lots() TO authenticated;
