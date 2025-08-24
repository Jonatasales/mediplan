'use client';

import { useState, useEffect } from 'react';
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

type Hospital = Database['public']['Tables']['hospitais']['Row'];

const formSchema = z.object({
  hospital_id: z.string().min(1, 'Selecione um hospital'),
  data: z.date(),
  inicio: z.string().optional(),
  fim: z.string().optional(),
  turno: z.string().optional(),
  valor_bruto: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlantaoFormProps {
  plantao: Plantao | null;
  onSave: () => void;
  onCancel: () => void;
}

export function PlantaoForm({ plantao, onSave, onCancel }: PlantaoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hospital_id: plantao?.hospital_id || '',
      data: plantao ? new Date(plantao.data) : new Date(),
      inicio: plantao?.inicio?.substring(0, 5) || '',
      fim: plantao?.fim?.substring(0, 5) || '',
      turno: plantao?.turno || '',
      valor_bruto: plantao?.valor_bruto || 0,
      observacoes: plantao?.observacoes || '',
    },
  });

  useEffect(() => {
    fetchHospitais();
  }, []);

  const fetchHospitais = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('hospitais')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;
      
      setHospitais(data || []);
    } catch (error: any) {
      toast.error('Erro ao buscar hospitais', {
        description: error.message,
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const formattedData = {
        user_id: user.id,
        hospital_id: data.hospital_id,
        data: format(data.data, 'yyyy-MM-dd'),
        inicio: data.inicio || null,
        fim: data.fim || null,
        turno: data.turno || null,
        valor_bruto: data.valor_bruto,
        observacoes: data.observacoes || null,
      };

      if (plantao) {
        // Atualizar plantão existente
        const { error } = await supabase
          .from('plantoes')
          .update(formattedData)
          .eq('id', plantao.id);

        if (error) throw error;
        
        toast.success('Plantão atualizado com sucesso');
      } else {
        // Criar novo plantão
        const { error } = await supabase
          .from('plantoes')
          .insert(formattedData);

        if (error) throw error;
        
        toast.success('Plantão criado com sucesso');
      }
      
      onSave();
    } catch (error: any) {
      toast.error(plantao ? 'Erro ao atualizar plantão' : 'Erro ao criar plantão', {
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
          name="hospital_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hospital</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="">Selecione um hospital</option>
                  {hospitais.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.nome}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Plantão</FormLabel>
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
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Início (opcional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Fim (opcional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="turno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Manhã, Tarde, Noite, 12h, 24h" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="valor_bruto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Bruto (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Observações sobre o plantão" {...field} />
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
                {plantao ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              plantao ? 'Salvar' : 'Criar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
