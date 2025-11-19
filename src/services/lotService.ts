import { supabase } from '@/lib/supabaseClient';

// Definição dos tipos
export interface Bid {
  id: string;
  user_id: string;
  bid_amount: number;
  created_at: string;
  // Informações adicionais que podem ser úteis
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface Lot {
  id: string;
  title: string;
  short_description: string;
  description: string;
  image_url: string;
  image_urls?: string | null;
  initial_bid: number;
  current_bid: number;
  bids_count: number;
  ends_at: string;
  status: 'aberto' | 'encerrado';
  created_at: string;
  // Lances associados a este lote
  bids?: Bid[];
  [key: string]: any; // Para propriedades adicionais
}

// Alias para manter compatibilidade com código existente
export type BidHistoryEntry = Bid;

// Interface para os parâmetros de criação de um novo lance
export interface CreateBidParams {
  lot_id: string;
  amount: number;
  user_id: string;
}

export const fetchAllLots = async (): Promise<Lot[]> => {
  console.log('🔍 Buscando lotes no banco de dados...');
  
  try {
    // Usando uma consulta SQL direta com relacionamento de categorias
    const { data: lots, error } = await supabase
      .from('lots')
      .select('*, categories:category_id ( id, slug, name )')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar lotes:', error);
      
      // Se houver erro, tenta buscar com uma consulta SQL personalizada
      console.log('🔄 Tentando buscar lotes com consulta personalizada...');
      const { data: customQueryData, error: customError } = await supabase
        .rpc('get_public_lots')
        .select('*, categories:category_id ( id, slug, name )');
      
      if (customError) {
        console.error('❌ Erro na consulta personalizada:', customError);
        
        // Última tentativa: buscar com uma consulta SQL bruta
        console.log('🔄 Tentando consulta SQL bruta...');
        const { data: rawData, error: rawError } = await supabase
          .from('lots')
          .select('*, categories:category_id ( id, slug, name )')
          .order('created_at', { ascending: false });
        
        if (rawError) {
          console.error('❌ Erro na consulta bruta:', rawError);
          throw rawError;
        }
        
        console.log(`✅ ${rawData?.length || 0} lotes encontrados (consulta bruta)`);
        return formatLots(rawData || []);
      }
      
      console.log(`✅ ${customQueryData?.length || 0} lotes encontrados (consulta personalizada)`);
      return formatLots(customQueryData || []);
    }
    
    console.log(`✅ ${lots?.length || 0} lotes encontrados`);
    return formatLots(lots || []);
    
  } catch (error) {
    console.error('❌ Erro em fetchAllLots:', error);
    throw error;
  }
};

// Função auxiliar para formatar os lotes
const formatLots = (lots: any[]): Lot[] => {
  return lots.map(lot => ({
    id: lot.id,
    title: lot.title || 'Lote sem título',
    short_description: lot.short_description || 'Descrição não disponível',
    description: lot.description || '',
    image_url: lot.image_url || 'https://via.placeholder.com/300x200?text=Sem+imagem',
    image_urls: lot.image_urls || null,
    initial_bid: Number(lot.initial_bid) || 0,
    current_bid: Number(lot.current_bid) || Number(lot.initial_bid) || 0,
    bids_count: Number(lot.bids_count) || 0,
    ends_at: lot.ends_at || new Date().toISOString(),
    status: lot.status || (new Date(lot.ends_at) > new Date() ? 'aberto' : 'encerrado'),
    created_at: lot.created_at || new Date().toISOString(),
    bids: [], // Inicialmente vazio, podemos carregar os lances depois se necessário
    // Normaliza informações de categoria vindas da tabela categories
    category_id: lot.category_id || lot.categories?.id || null,
    category: lot.category || lot.categories?.slug || null,
    category_name: lot.category_name || lot.categories?.name || null,
  }));
};

export const fetchLotById = async (id: string): Promise<Lot | null> => {
  const { data, error } = await supabase
    .from('lots')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
    console.error(`Erro ao buscar lote com ID ${id}:`, error);
    throw error;
  }
  return data as Lot | null;
};

// Função para buscar o histórico de lances de um lote
export const fetchLotBids = async (lotId: string): Promise<Bid[]> => {
  console.log(`🔍 Buscando lances para o lote ${lotId}...`);
  
  try {
    // Primeiro, buscamos apenas os dados básicos dos lances
    const { data: bidsData, error } = await supabase
      .from('bids')
      .select('id, user_id, bid_amount, created_at, lot_id')
      .eq('lot_id', lotId)
      .order('bid_amount', { ascending: false }) // Maior lance primeiro
      .order('created_at', { ascending: false }); // Lances mais recentes primeiro

    if (error) {
      console.error(`❌ Erro ao buscar histórico de lances para o lote ${lotId}:`, {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    if (!bidsData || bidsData.length === 0) {
      console.log(`ℹ️ Nenhum lance encontrado para o lote ${lotId}`);
      return [];
    }

    // Usamos os dados básicos do usuário que já temos
    // Evitamos consultar a tabela users diretamente para evitar recursão
    const usersMap = new Map();
    const uniqueUserIds = [...new Set(bidsData.map(bid => bid.user_id))];
    
    // Para cada usuário único, criamos um objeto básico
    uniqueUserIds.forEach(userId => {
      usersMap.set(userId, {
        id: userId,
        email: 'usuario@exemplo.com', // Valor padrão
        user_metadata: {}
      });
    });
    
    // Mapeia os dados para o formato correto
    const bids = bidsData.map((bid: any) => {
      const userData = usersMap.get(bid.user_id) || {
        id: bid.user_id,
        email: '',
        user_metadata: {}
      };
      
      return {
        id: bid.id,
        user_id: bid.user_id,
        bid_amount: bid.bid_amount,
        created_at: bid.created_at,
        user: userData
      };
    });
    
    console.log(`✅ ${bids.length} lances encontrados para o lote ${lotId}`);
    return bids;
  } catch (error) {
    console.error('Erro inesperado ao buscar lances:', error);
    throw error;
  }
};

// Nova função para criar um lote
export const createLot = async (lotData: Omit<Lot, 'id' | 'created_at' | 'status' | 'bids_count' | 'current_bid'>): Promise<Lot> => {
  const { data, error } = await supabase
    .from('lots')
    .insert([
      {
        ...lotData,
        current_bid: lotData.initial_bid,
        status: 'aberto',
        bids_count: 0
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar lote:', error);
    throw error;
  }

  return data as Lot;
};

export const createBid = async (bidData: CreateBidParams): Promise<Bid> => {
  console.log('💾 Salvando novo lance:', {
    ...bidData,
    amount: bidData.amount,
    amountType: typeof bidData.amount,
    isNumber: typeof bidData.amount === 'number',
    isFinite: Number.isFinite(bidData.amount),
    isNaN: isNaN(bidData.amount)
  });
  
  // Verifica se o lance é maior que o lance atual
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('current_bid, initial_bid, ends_at')
    .eq('id', bidData.lot_id)
    .single();

  if (lotError) {
    console.error('❌ Erro ao verificar lote:', lotError);
    throw new Error('Erro ao verificar informações do lote');
  }

  // Verifica se o leilão já encerrou
  if (new Date(lot.ends_at) < new Date()) {
    throw new Error('Este leilão já está encerrado');
  }

  // Converte para número e garante que o valor seja maior que zero
  const bidAmount = Number(bidData.amount);
  if (isNaN(bidAmount) || bidAmount <= 0) {
    throw new Error('O valor do lance deve ser um número maior que zero');
  }

  // O valor mínimo do lance é o maior entre o lance atual e o lance inicial
  const minBid = Math.max(lot.current_bid || 0, lot.initial_bid || 0);
  
  if (bidData.amount <= minBid) {
    throw new Error(`O valor do lance deve ser maior que ${minBid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
  }

  // Primeiro, obtemos o título do lote em uma consulta separada
  const { data: lotData } = await supabase
    .from('lots')
    .select('title')
    .eq('id', bidData.lot_id)
    .single();

  // Prepara os dados do lance com valores numéricos válidos
  const bidInsertData = {
    lot_id: bidData.lot_id,
    user_id: bidData.user_id,
    amount: bidAmount, // Já convertido e validado
    bid_amount: bidAmount, // Usa o mesmo valor já validado
    lot_title: lotData?.title || 'Lote sem título',
    status: 'Pendente',
    created_at: new Date().toISOString()
  };
  
  // Garante que o valor seja um número válido e maior que zero
  if (isNaN(bidInsertData.amount) || bidInsertData.amount <= 0) {
    throw new Error('Valor do lance inválido');
  }

  console.log('📝 Dados do lance a serem inseridos:', bidInsertData);

  // Cria o lance com os dados formatados
  const { data, error } = await supabase
    .from('bids')
    .insert([bidInsertData])
    .select('id, user_id, bid_amount, created_at, lot_id, amount')
    .single();

  if (error) {
    console.error('❌ Erro ao salvar lance:', error);
    throw error;
  }

  // Atualiza o lote com o novo lance atual
  // Usamos uma atualização direta sem contar os lances para evitar problemas de RLS
  const { error: updateError } = await supabase
    .from('lots')
    .update({
      current_bid: bidData.amount,
      bids_count: supabase.rpc('increment', { x: 1 }) // Incrementa o contador em 1
    })
    .eq('id', bidData.lot_id);

  if (updateError) {
    console.error('❌ Erro ao atualizar lote:', updateError);
    // Não lançamos o erro aqui para não reverter o lance já salvo
    // Em um ambiente de produção, considere usar transações
  }

  console.log('✅ Lance salvo com sucesso:', data);
  return data as Bid;
};

// Nova função para atualizar um lote existente
export const updateLot = async (id: string, lotData: Partial<Omit<Lot, 'id' | 'created_at' | 'bids_count' | 'current_bid'>>): Promise<Lot> => {
  const { data, error } = await supabase
    .from('lots')
    .update(lotData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar lote com ID ${id}:`, error);
    throw error;
  }
  return data as Lot;
};

// Nova função para deletar um lote
export const deleteLot = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('lots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao deletar lote com ID ${id}:`, error);
    throw error;
  }
};