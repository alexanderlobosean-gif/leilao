-- Verifica se a tabela bids existe
DO $$
BEGIN
    -- Verifica se a tabela bids existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bids') THEN
        -- Verifica se a coluna bid_amount existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bids' AND column_name = 'bid_amount') THEN
            -- Adiciona a coluna bid_amount se não existir
            ALTER TABLE public.bids ADD COLUMN bid_amount numeric NOT NULL DEFAULT 0;
            RAISE NOTICE 'Coluna bid_amount adicionada à tabela bids';
        END IF;
        
        -- Atualiza a coluna bid_amount com os valores de amount se existir
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bids' AND column_name = 'amount') THEN
            UPDATE public.bids SET bid_amount = amount WHERE bid_amount IS NULL OR bid_amount = 0;
            RAISE NOTICE 'Valores de amount copiados para bid_amount';
            
            -- Opcional: remover a coluna amount após a migração
            -- ALTER TABLE public.bids DROP COLUMN amount;
        END IF;
    ELSE
        -- Cria a tabela se não existir
        CREATE TABLE public.bids (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            lot_id uuid NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
            lot_title text,
            bid_amount numeric NOT NULL,
            status text DEFAULT 'Pendente' NOT NULL,
            created_at timestamp with time zone DEFAULT now() NOT NULL
        );
        
        -- Cria os índices
        CREATE INDEX bids_user_id_idx ON public.bids (user_id);
        CREATE INDEX bids_lot_id_idx ON public.bids (lot_id);
        
        RAISE NOTICE 'Tabela bids criada com sucesso';
    END IF;
END $$;
