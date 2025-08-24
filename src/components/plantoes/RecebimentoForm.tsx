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
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

type Plantao = Database['public']['Tables']['plantoes']['Row'] & {
  hospitais?: Database['public']['Tables']['hospitais']['Row'];
};

const formSchema = z.object({
  valor_recebido: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  recebido_em: z.date(),
  conciliado: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface RecebimentoFormProps {
  plantao: Plantao;
  onSave: () => void;
  onCancel: () => void;
}

export function RecebimentoForm({ plantao, onSave, onCancel }: RecebimentoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valor_recebido: plantao.valor_bruto,
      recebido_em: new Date(),
      conciliado: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Registrar recebimento
      const { error: recebimentoError } = await supabase
        .from('recebimentos')
        .insert({
          user_id: user.id,
          plantao_id: plantao.id,
          valor_recebido: data.valor_recebido,
          recebido_em: format(data.recebido_em, 'yyyy-MM-dd'),
          conciliado: data.conciliado,
          conciliado_em: data.conciliado ? new Date().toISOString() : null,
        });

      if (recebimentoError) throw recebimentoError;

      // Atualizar status do plantão
      const novoStatus = data.conciliado ? 'CONCILIADO' : 'RECEBIDO';
      const { error: plantaoError } = await supabase
        .from('plantoes')
        .update({ status: novoStatus })
        .eq('id', plantao.id);

      if (plantaoError) throw plantaoError;
      
      toast.success('Recebimento registrado com sucesso');
      onSave();
    } catch (error: any) {
      toast.error('Erro ao registrar recebimento', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">Plantão em {plantao.hospitais?.nome}</p>
          <p className="text-sm text-gray-500">Data: {format(new Date(plantao.data), 'dd/MM/yyyy')}</p>
          <p className="text-sm text-gray-500">Valor bruto: {formatCurrency(plantao.valor_bruto)}</p>
        </div>

        <FormField
          control={form.control}
          name="valor_recebido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Recebido (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="recebido_em"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Recebimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="conciliado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Marcar como conciliado</FormLabel>
                <p className="text-sm text-gray-500">
                  Marque esta opção se o valor já foi conferido e está correto
                </p>
              </div>
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
                Registrando...
              </>
            ) : (
              'Registrar Recebimento'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
