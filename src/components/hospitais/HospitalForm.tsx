'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/lib/supabase';

type Hospital = Database['public']['Tables']['hospitais']['Row'];

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  prazo_pagamento_dias: z.coerce.number().int().min(0, 'Prazo deve ser um número positivo'),
  dia_corte: z.coerce.number().int().min(0, 'Dia de corte deve ser um número positivo').max(31, 'Dia de corte deve ser no máximo 31'),
});

type FormValues = z.infer<typeof formSchema>;

interface HospitalFormProps {
  hospital: Hospital | null;
  onSave: () => void;
  onCancel: () => void;
}

export function HospitalForm({ hospital, onSave, onCancel }: HospitalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: hospital?.nome || '',
      cnpj: hospital?.cnpj || '',
      prazo_pagamento_dias: hospital?.prazo_pagamento_dias || 0,
      dia_corte: hospital?.dia_corte || 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (hospital) {
        // Atualizar hospital existente
        const { error } = await supabase
          .from('hospitais')
          .update({
            nome: data.nome,
            cnpj: data.cnpj || null,
            prazo_pagamento_dias: data.prazo_pagamento_dias,
            dia_corte: data.dia_corte,
          })
          .eq('id', hospital.id);

        if (error) throw error;
        
        toast.success('Hospital atualizado com sucesso');
      } else {
        // Criar novo hospital
        const { error } = await supabase
          .from('hospitais')
          .insert({
            user_id: user.id,
            nome: data.nome,
            cnpj: data.cnpj || null,
            prazo_pagamento_dias: data.prazo_pagamento_dias,
            dia_corte: data.dia_corte,
          });

        if (error) throw error;
        
        toast.success('Hospital criado com sucesso');
      }
      
      onSave();
    } catch (error: any) {
      toast.error(hospital ? 'Erro ao atualizar hospital' : 'Erro ao criar hospital', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Hospital</FormLabel>
              <FormControl>
                <Input placeholder="Nome do hospital" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="00.000.000/0000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="prazo_pagamento_dias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo de Pagamento (dias)</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dia_corte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia de Corte (opcional)</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="31" placeholder="0 = sem dia de corte" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {hospital ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              hospital ? 'Salvar' : 'Criar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
