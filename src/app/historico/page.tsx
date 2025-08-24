'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

type Plantao = Database['public']['Tables']['plantoes']['Row'] & {
  hospitais: Database['public']['Tables']['hospitais']['Row'];
  recebimentos?: Database['public']['Tables']['recebimentos']['Row'][];
};

type Hospital = Database['public']['Tables']['hospitais']['Row'];

type FiltroState = {
  dataInicio: Date;
  dataFim: Date;
  hospitalId: string | null;
  status: string | null;
};

export default function HistoricoPage() {
  const { user } = useAuth();
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltroDialogOpen, setIsFiltroDialogOpen] = useState(false);
  
  // Estado para filtros
  const [filtro, setFiltro] = useState<FiltroState>({
    dataInicio: startOfMonth(subMonths(new Date(), 3)),
    dataFim: endOfMonth(new Date()),
    hospitalId: null,
    status: null,
  });

  useEffect(() => {
    if (user) {
      fetchHospitais();
      fetchPlantoes();
    }
  }, [user]);

  const fetchHospitais = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitais')
        .select('*')
        .eq('user_id', user?.id)
        .order('nome');

      if (error) throw error;
      
      setHospitais(data || []);
    } catch (error: any) {
      toast.error('Erro ao buscar hospitais', {
        description: error.message,
      });
    }
  };

  const fetchPlantoes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('plantoes')
        .select('*, hospitais(*), recebimentos(*)')
        .eq('user_id', user?.id)
        .gte('data', format(filtro.dataInicio, 'yyyy-MM-dd'))
        .lte('data', format(filtro.dataFim, 'yyyy-MM-dd'))
        .order('data', { ascending: false });
      
      if (filtro.hospitalId) {
        query = query.eq('hospital_id', filtro.hospitalId);
      }
      
      if (filtro.status) {
        query = query.eq('status', filtro.status);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      setPlantoes(data as Plantao[] || []);
    } catch (error: any) {
      toast.error('Erro ao buscar histórico de plantões', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (newFiltro: Partial<FiltroState>) => {
    setFiltro(prev => ({ ...prev, ...newFiltro }));
  };

  const handleAplicarFiltro = () => {
    fetchPlantoes();
    setIsFiltroDialogOpen(false);
  };

  const handleExportarCSV = () => {
    try {
      // Preparar dados para CSV
      const headers = [
        'Data', 
        'Hospital', 
        'Horário', 
        'Valor Bruto', 
        'Status', 
        'Previsão de Pagamento',
        'Data Recebimento',
        'Valor Recebido'
      ];
      
      const rows = plantoes.map(plantao => {
        const recebimento = plantao.recebimentos && plantao.recebimentos.length > 0 
          ? plantao.recebimentos[0] 
          : null;
        
        return [
          format(new Date(plantao.data), 'dd/MM/yyyy'),
          plantao.hospitais.nome,
          plantao.inicio && plantao.fim 
            ? `${plantao.inicio.substring(0, 5)} - ${plantao.fim.substring(0, 5)}`
            : plantao.turno || '-',
          plantao.valor_bruto.toString().replace('.', ','),
          getStatusText(plantao.status),
          plantao.previsao_pagamento ? format(new Date(plantao.previsao_pagamento), 'dd/MM/yyyy') : '-',
          recebimento ? format(new Date(recebimento.recebido_em), 'dd/MM/yyyy') : '-',
          recebimento ? recebimento.valor_recebido.toString().replace('.', ',') : '-'
        ];
      });
      
      // Converter para CSV
      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
      ].join('\n');
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `plantoes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Arquivo CSV gerado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao exportar CSV', {
        description: error.message,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LANCADO': return 'Lançado';
      case 'PREVISTO': return 'Previsto';
      case 'RECEBIDO': return 'Recebido';
      case 'CONCILIADO': return 'Conciliado';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LANCADO':
        return <Badge variant="outline" className="bg-gray-100">Lançado</Badge>;
      case 'PREVISTO':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Previsto</Badge>;
      case 'RECEBIDO':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Recebido</Badge>;
      case 'CONCILIADO':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Conciliado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calcular totais
  const totalPlantoes = plantoes.length;
  const totalValorBruto = plantoes.reduce((sum, plantao) => sum + plantao.valor_bruto, 0);
  const totalRecebido = plantoes.reduce((sum, plantao) => {
    if (plantao.recebimentos && plantao.recebimentos.length > 0) {
      return sum + plantao.recebimentos[0].valor_recebido;
    }
    return sum;
  }, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Histórico de Plantões</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsFiltroDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Filtrar
            </Button>
            <Button 
              onClick={handleExportarCSV}
              className="flex items-center gap-2"
              disabled={plantoes.length === 0}
            >
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total de Plantões</p>
            <p className="text-2xl font-bold">{totalPlantoes}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Valor Bruto Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValorBruto)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Recebido</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRecebido)}</p>
          </div>
        </div>

        {/* Tabela de plantões */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
          ) : plantoes.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">Nenhum plantão encontrado</h3>
              <p className="mt-1 text-gray-500">
                Tente ajustar os filtros para ver mais resultados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Bruto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previsão
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recebimento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantoes.map((plantao) => {
                    const recebimento = plantao.recebimentos && plantao.recebimentos.length > 0 
                      ? plantao.recebimentos[0] 
                      : null;
                    
                    return (
                      <tr key={plantao.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(plantao.data)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {plantao.hospitais.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plantao.inicio && plantao.fim 
                            ? `${plantao.inicio.substring(0, 5)} - ${plantao.fim.substring(0, 5)}`
                            : plantao.turno || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(plantao.valor_bruto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(plantao.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plantao.previsao_pagamento ? formatDate(plantao.previsao_pagamento) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {recebimento ? (
                            <div>
                              <div>{formatDate(recebimento.recebido_em)}</div>
                              <div className="text-green-600">{formatCurrency(recebimento.valor_recebido)}</div>
                            </div>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de filtro */}
      <Dialog open={isFiltroDialogOpen} onOpenChange={setIsFiltroDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar Histórico</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtro.dataInicio && "text-muted-foreground"
                      )}
                    >
                      {filtro.dataInicio ? (
                        format(filtro.dataInicio, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtro.dataInicio}
                      onSelect={(date) => date && handleFiltroChange({ dataInicio: date })}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtro.dataFim && "text-muted-foreground"
                      )}
                    >
                      {filtro.dataFim ? (
                        format(filtro.dataFim, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtro.dataFim}
                      onSelect={(date) => date && handleFiltroChange({ dataFim: date })}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Hospital</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filtro.hospitalId || ''}
                onChange={(e) => handleFiltroChange({ hospitalId: e.target.value || null })}
              >
                <option value="">Todos os hospitais</option>
                {hospitais.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filtro.status || ''}
                onChange={(e) => handleFiltroChange({ status: e.target.value || null })}
              >
                <option value="">Todos os status</option>
                <option value="LANCADO">Lançado</option>
                <option value="PREVISTO">Previsto</option>
                <option value="RECEBIDO">Recebido</option>
                <option value="CONCILIADO">Conciliado</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFiltroDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleAplicarFiltro}
              >
                Aplicar Filtro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
