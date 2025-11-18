import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Tipos de dados
export interface Bid {
  id: string;
  user_id: string;
  lot_id: string;
  lot_title: string; // Adicionado para exibição
  bid_amount: number;
  status: 'Vencedor' | 'Superado' | 'Perdedor' | 'Pendente';
  created_at: string;
}

export interface Qualification {
  id: string;
  user_id: string;
  type: string;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado';
  expires_at: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado';
  uploaded_at: string;
}

// Funções para buscar dados
export const fetchUserBids = async (userId: string): Promise<Bid[]> => {
  const { data, error } = await supabase
    .from('bids')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar lances:', error);
    throw error;
  }
  return data as Bid[];
};

export const fetchUserQualifications = async (userId: string): Promise<Qualification[]> => {
  const { data, error } = await supabase
    .from('qualifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar habilitações:', error);
    throw error;
  }
  return data as Qualification[];
};

export const fetchUserDocuments = async (userId: string): Promise<Document[]> => {
  try {
    // Usando rpc para evitar problemas de RLS
    const { data, error } = await supabase.rpc('get_user_documents', { user_id: userId });
    
    if (error) {
      console.error('Erro ao buscar documentos via RPC:', error);
      throw error;
    }
    return data as Document[];
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw error;
  }
};

// Funções para upload de documentos
export const uploadDocumentFile = async (userId: string, file: File): Promise<string> => {
  try {
    // Verifica se o arquivo é muito grande (limite de 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('O arquivo é muito grande. O tamanho máximo permitido é 5MB.');
    }

    // Verifica se o tipo de arquivo é permitido
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Por favor, envie um arquivo PDF, JPG ou PNG.');
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('Iniciando upload do arquivo:', filePath);
    
    const { data, error } = await supabase.storage
      .from('userdocuments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw new Error(`Erro ao enviar o arquivo: ${error.message}`);
    }

    console.log('Arquivo enviado com sucesso, obtendo URL pública...');
    
    // Obtém a URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from('userdocuments')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Não foi possível obter a URL pública do arquivo.');
    }

    console.log('URL pública gerada com sucesso:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error('Erro detalhado no upload:', error);
    throw error;
  }
};

export const saveDocumentMetadata = async (userId: string, name: string, fileUrl: string): Promise<Document> => {
  try {
    const { data, error } = await supabase.rpc('insert_document', {
      p_user_id: userId,
      p_name: name,
      p_file_url: fileUrl
    });

    if (error) {
      console.error('Erro ao salvar metadados do documento via RPC:', error);
      throw error;
    }
    
    // A função RPC retorna um array, então pegamos o primeiro item
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Erro detalhado ao salvar documento:', error);
    throw error;
  }
};

// Nova função para atualizar um documento existente (substituir arquivo e metadados)
export const updateDocumentFileAndMetadata = async (
  documentId: string,
  userId: string,
  file: File,
  newName: string
): Promise<Document> => {
  // Primeiro, faz o upload do novo arquivo para o storage
  const fileExtension = file.name.split('.').pop();
  // Cria um novo caminho com timestamp para evitar conflitos e manter histórico se necessário
  const filePath = `${userId}/${Date.now()}_${newName.replace(/\s/g, '_')}.${fileExtension}`; 

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('userdocuments') // Nome do bucket no Supabase Storage
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Não sobrescreve, cria um novo arquivo
    });

  if (uploadError) {
    console.error('Erro ao fazer upload do novo arquivo para substituição:', uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('userdocuments')
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Não foi possível obter a URL pública do novo arquivo.');
  }

  const newFileUrl = publicUrlData.publicUrl;

  // Em seguida, atualiza os metadados do documento na tabela 'documents'
  const { data, error } = await supabase
    .from('documents')
    .update({ name: newName, file_url: newFileUrl, status: 'Pendente', uploaded_at: new Date().toISOString() })
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar metadados do documento:', error);
    // Opcionalmente, deleta o arquivo recém-enviado se a atualização dos metadados falhar
    await supabase.storage.from('userdocuments').remove([filePath]);
    throw error;
  }
  return data as Document;
};

// Nova função para solicitar uma nova habilitação
export const requestNewQualification = async (userId: string, type: string): Promise<Qualification> => {
  const { data, error } = await supabase
    .from('qualifications')
    .insert({ user_id: userId, type, status: 'Pendente' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao solicitar nova habilitação:', error);
    throw error;
  }
  return data as Qualification;
};