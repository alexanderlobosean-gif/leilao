import { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
  interface Window {
    env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
        };
        Insert: {
          id?: string;
          email: string;
          user_type?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          user_type?: 'admin' | 'user';
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
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
          rejection_reason?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          file_url: string;
          status?: 'Pendente' | 'Aprovado' | 'Rejeitado';
          uploaded_at?: string;
          rejection_reason?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          file_url?: string;
          status?: 'Pendente' | 'Aprovado' | 'Rejeitado';
          uploaded_at?: string;
          rejection_reason?: string;
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
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type { SupabaseClient, Session };
