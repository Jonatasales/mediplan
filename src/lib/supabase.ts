import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqbiczyksmfgskxqwskl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmljenlrc21mZ3NreHF3c2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjI1NzQsImV4cCI6MjA3MTYzODU3NH0.hpUwdj2BvnDYyJOCL3PpQ1AlbY-8WUzJwvzCCAQOvNI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      hospitais: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          cnpj: string | null;
          prazo_pagamento_dias: number;
          dia_corte: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          cnpj?: string | null;
          prazo_pagamento_dias?: number;
          dia_corte?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          cnpj?: string | null;
          prazo_pagamento_dias?: number;
          dia_corte?: number;
          created_at?: string;
        };
      };
      plantoes: {
        Row: {
          id: string;
          user_id: string;
          hospital_id: string;
          data: string;
          inicio: string | null;
          fim: string | null;
          turno: string | null;
          valor_bruto: number;
          observacoes: string | null;
          status: 'LANCADO' | 'PREVISTO' | 'RECEBIDO' | 'CONCILIADO';
          previsao_pagamento: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hospital_id: string;
          data: string;
          inicio?: string | null;
          fim?: string | null;
          turno?: string | null;
          valor_bruto: number;
          observacoes?: string | null;
          status?: 'LANCADO' | 'PREVISTO' | 'RECEBIDO' | 'CONCILIADO';
          previsao_pagamento?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          hospital_id?: string;
          data?: string;
          inicio?: string | null;
          fim?: string | null;
          turno?: string | null;
          valor_bruto?: number;
          observacoes?: string | null;
          status?: 'LANCADO' | 'PREVISTO' | 'RECEBIDO' | 'CONCILIADO';
          previsao_pagamento?: string | null;
          created_at?: string;
        };
      };
      profissionais_saude: {
        Row: {
          id: string;
          nome: string;
          cpf: string;
          conselho_classe: string | null;
          numero_registro: string | null;
          especialidade: string | null;
          telefone: string | null;
          email: string;
          endereco: string | null;
          ativo: boolean;
          data_criacao: string | null;
        };
        Insert: {
          id: string;
          nome: string;
          cpf: string;
          conselho_classe?: string | null;
          numero_registro?: string | null;
          especialidade?: string | null;
          telefone?: string | null;
          email: string;
          endereco?: string | null;
          ativo?: boolean;
          data_criacao?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          cpf?: string;
          conselho_classe?: string | null;
          numero_registro?: string | null;
          especialidade?: string | null;
          telefone?: string | null;
          email?: string;
          endereco?: string | null;
          ativo?: boolean;
          data_criacao?: string | null;
        };
      };
      recebimentos: {
        Row: {
          id: string;
          user_id: string;
          plantao_id: string;
          valor_recebido: number;
          recebido_em: string;
          conciliado: boolean;
          conciliado_em: string | null;
          comprovante_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plantao_id: string;
          valor_recebido: number;
          recebido_em: string;
          conciliado?: boolean;
          conciliado_em?: string | null;
          comprovante_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plantao_id?: string;
          valor_recebido?: number;
          recebido_em?: string;
          conciliado?: boolean;
          conciliado_em?: string | null;
          comprovante_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      v_resumo_mensal: {
        Row: {
          user_id: string;
          mes: string;
          total_plantoes: number;
          total_previsto: number | null;
          total_recebido: number | null;
          total_atrasado: number | null;
          qtd_atrasos: number | null;
        };
      };
    };
  };
};
