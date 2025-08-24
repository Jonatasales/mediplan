'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Check, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlantaoForm } from '@/components/plantoes/PlantaoForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { RecebimentoForm } from '@/components/plantoes/RecebimentoForm';

type Plantao = Database['public']['Tables']['plantoes']['Row'] & {
  hospitais: Database['public']['Tables']['hospitais']['Row'];
};

export default function PlantoesPage() {
  const { user } = useAuth();
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlantaoDialogOpen, setIsPlantaoDialogOpen] = useState(false);
  const [isRecebimentoDialogOpen, setIsRecebimentoDialogOpen] = useState(false);
  const [currentPlantao, setCurrentPlantao] = useState<Plantao | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPlantoes();
    }
  }, [user, filtroStatus]);

  const fetchPlantoes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('plantoes')
        .select('*, hospitais(*)')
        .eq('user_id', user?.id)
        .order('data', { ascending: false });
      
      if (filtroStatus) {
        query = query.eq('status', filtroStatus);
      }
      
      const { data, error } = await query.limit(50);

      if (error) throw error;
      
      setPlantoes(data as Plantao[] || []);
    } catch (error: any) {
      toast.error('Erro ao buscar plantões', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlantaoDialog = (plantao: Plantao | null = null) => {
    setCurrentPlantao(plantao);
    setIsPlantaoDialogOpen(true);
  };

  const handleClosePlantaoDialog = () => {
    setIsPlantaoDialogOpen(false);
    setCurrentPlantao(null);
  };

  const handleOpenRecebimentoDialog = (plantao: Plantao) => {
    setCurrentPlantao(plantao);
    setIsRecebimentoDialogOpen(true);
  };

  const handleCloseRecebimentoDialog = () => {
    setIsRecebimentoDialogOpen(false);
    setCurrentPlantao(null);
  };

  const handleDeletePlantao = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plantão?')) return;
    
    try {
      const { error } = await supabase
        .from('plantoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Plantão excluído com sucesso');
      fetchPlantoes();
    } catch (error: any) {
      toast.error('Erro ao excluir plantão', {
        description: error.message,
      });
    }
  };

  const handleSavePlantao = async () => {
    fetchPlantoes();
    handleClosePlantaoDialog();
  };

  const handleSaveRecebimento = async () => {
    fetchPlantoes();
    handleCloseRecebimentoDialog();
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Plantões</h1>
          <Button onClick={() => handleOpenPlantaoDialog()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Plantão
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={filtroStatus === null ? "default" : "outline"} 
              onClick={() => setFiltroStatus(null)}
            >
              Todos
            </Button>
            <Button 
              variant={filtroStatus === 'LANCADO' ? "default" : "outline"} 
              onClick={() => setFiltroStatus('LANCADO')}
            >
              Lançados
            </Button>
            <Button 
              variant={filtroStatus === 'PREVISTO' ? "default" : "outline"} 
              onClick={() => setFiltroStatus('PREVISTO')}
            >
              Previstos
            </Button>
            <Button 
              variant={filtroStatus === 'RECEBIDO' ? "default" : "outline"} 
              onClick={() => setFiltroStatus('RECEBIDO')}
            >
              Recebidos
            </Button>
            <Button 
              variant={filtroStatus === 'CONCILIADO' ? "default" : "outline"} 
              onClick={() => setFiltroStatus('CONCILIADO')}
            >
              Conciliados
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
          ) : plantoes.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">Nenhum plantão encontrado</h3>
              <p className="mt-1 text-gray-500">
                {filtroStatus 
                  ? 'Tente outro filtro ou adicione um novo plantão.' 
                  : 'Comece adicionando seu primeiro plantão.'}
              </p>
              <div className="mt-6">
                <Button onClick={() => handleOpenPlantaoDialog()}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Plantão
                </Button>
              </div>
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
                      Valor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previsão
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantoes.map((plantao) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {(plantao.status === 'LANCADO' || plantao.status === 'PREVISTO') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRecebimentoDialog(plantao)}
                            className="text-green-600 hover:text-green-900 mr-2"
                            title="Marcar como recebido"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenPlantaoDialog(plantao)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlantao(plantao.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isPlantaoDialogOpen} onOpenChange={setIsPlantaoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentPlantao ? 'Editar Plantão' : 'Novo Plantão'}</DialogTitle>
          </DialogHeader>
          <PlantaoForm 
            plantao={currentPlantao} 
            onSave={handleSavePlantao} 
            onCancel={handleClosePlantaoDialog} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isRecebimentoDialogOpen} onOpenChange={setIsRecebimentoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Recebimento</DialogTitle>
          </DialogHeader>
          {currentPlantao && (
            <RecebimentoForm 
              plantao={currentPlantao} 
              onSave={handleSaveRecebimento} 
              onCancel={handleCloseRecebimentoDialog} 
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
