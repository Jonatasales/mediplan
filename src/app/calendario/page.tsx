'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  addDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlantaoForm } from '@/components/plantoes/PlantaoForm';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

type Plantao = Database['public']['Tables']['plantoes']['Row'] & {
  hospitais: Database['public']['Tables']['hospitais']['Row'];
};

export default function CalendarioPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [previsoes, setPrevisoes] = useState<Plantao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchPlantoes();
    }
  }, [user, currentMonth]);

  const fetchPlantoes = async () => {
    try {
      setLoading(true);
      const firstDay = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const lastDay = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      // Buscar plantões do mês
      const { data: plantoesData, error: plantoesError } = await supabase
        .from('plantoes')
        .select('*, hospitais(*)')
        .eq('user_id', user?.id)
        .gte('data', firstDay)
        .lte('data', lastDay);

      if (plantoesError) throw plantoesError;
      
      setPlantoes(plantoesData as Plantao[] || []);

      // Buscar previsões de pagamento do mês
      const { data: previsoesData, error: previsoesError } = await supabase
        .from('plantoes')
        .select('*, hospitais(*)')
        .eq('user_id', user?.id)
        .gte('previsao_pagamento', firstDay)
        .lte('previsao_pagamento', lastDay)
        .in('status', ['LANCADO', 'PREVISTO']);

      if (previsoesError) throw previsoesError;
      
      setPrevisoes(previsoesData as Plantao[] || []);
    } catch (error: any) {
      toast.error('Erro ao buscar dados do calendário', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleAddPlantao = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const handleSavePlantao = () => {
    fetchPlantoes();
    handleCloseDialog();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Gerar dias do calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Ajustar para começar no domingo (0) e terminar no sábado (6)
  const startWeekday = getDay(monthStart);
  const endWeekday = getDay(monthEnd);

  // Adicionar dias antes do primeiro dia do mês para completar a semana
  const previousMonthDays = Array.from({ length: startWeekday }, (_, i) => 
    addDays(monthStart, -(startWeekday - i))
  );

  // Adicionar dias depois do último dia do mês para completar a semana
  const nextMonthDays = Array.from({ length: 6 - endWeekday }, (_, i) => 
    addDays(monthEnd, i + 1)
  );

  // Combinar todos os dias para exibição
  const calendarDays = [...previousMonthDays, ...days, ...nextMonthDays];

  // Agrupar dias em semanas
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getPlantoesByDate = (date: Date) => {
    return plantoes.filter(plantao => 
      isSameDay(new Date(plantao.data), date)
    );
  };

  const getPrevisoesByDate = (date: Date) => {
    return previsoes.filter(plantao => 
      isSameDay(new Date(plantao.previsao_pagamento || ''), date)
    );
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendário</h1>
          <Button onClick={() => handleAddPlantao(new Date())} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Plantão
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Cabeçalho do calendário */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="outline" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button variant="outline" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className="py-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="divide-y">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 divide-x">
                  {week.map((day, dayIndex) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const dayPlantoes = getPlantoesByDate(day);
                    const dayPrevisoes = getPrevisoesByDate(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div 
                        key={dayIndex} 
                        className={`min-h-[120px] p-2 ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                        } ${isToday ? 'border-2 border-emerald-500' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${isToday ? 'text-emerald-600' : ''}`}>
                            {format(day, 'd')}
                          </span>
                          {isCurrentMonth && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0" 
                              onClick={() => handleAddPlantao(day)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {/* Plantões do dia */}
                        <div className="mt-1 space-y-1">
                          {dayPlantoes.map((plantao) => (
                            <div 
                              key={plantao.id} 
                              className="text-xs p-1 rounded bg-emerald-100 text-emerald-800 truncate"
                              title={`${plantao.hospitais.nome} - ${formatCurrency(plantao.valor_bruto)}`}
                            >
                              {plantao.hospitais.nome}
                            </div>
                          ))}

                          {/* Previsões de pagamento */}
                          {dayPrevisoes.map((previsao) => (
                            <div 
                              key={`prev-${previsao.id}`} 
                              className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                              title={`Recebimento: ${previsao.hospitais.nome} - ${formatCurrency(previsao.valor_bruto)}`}
                            >
                              <span className="text-blue-500">$</span> {previsao.hospitais.nome}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-emerald-100 mr-1"></div>
            <span>Plantões</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-blue-100 mr-1"></div>
            <span>Previsões de Pagamento</span>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Plantão</DialogTitle>
          </DialogHeader>
          <PlantaoForm 
            plantao={null} 
            onSave={handleSavePlantao} 
            onCancel={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
