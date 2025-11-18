// Tipos gerados automaticamente pelo Supabase CLI
// Atualize estes tipos sempre que o esquema do banco de dados for alterado

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          user_type: 'admin' | 'user';
          created_at: string;
          updated_at: string;
          is_active: boolean;
          raw_user_meta_data?: Json | null;
        };
        Insert: {
          id?: string;
          email: string;
          user_type?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          raw_user_meta_data?: Json | null;
        };
        Update: {
          id?: string;
          email?: string;
          user_type?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          raw_user_meta_data?: Json | null;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          file_url: string;
          status: 'Pendente' | 'Aprovado' | 'Rejeitado';
          uploaded_at: string;
          rejection_reason?: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          file_url: string;
          status?: 'Pendente' | 'Aprovado' | 'Rejeitado';
          uploaded_at?: string;
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          file_url?: string;
          status?: 'Pendente' | 'Aprovado' | 'Rejeitado';
          uploaded_at?: string;
          rejection_reason?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Tipos úteis para consultas
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Tipos específicos para o aplicativo
export type User = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;

export type Document = Tables<'documents'> & {
  user?: User;
};
export type DocumentInsert = TablesInsert<'documents'>;
export type DocumentUpdate = TablesUpdate<'documents'>;
