import { Database } from '@/lib/database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Tipos específicos para o projeto
export type Document = Tables<'documents'> & {
  user?: User;
  users?: User;
};

export type User = Tables<'users'> & {
  raw_user_meta_data?: {
    name?: string;
  };
};

export type DocumentUpdate = {
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  rejection_reason?: string | null;
};
