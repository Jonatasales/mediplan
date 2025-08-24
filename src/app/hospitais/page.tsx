'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HospitalForm } from '@/components/hospitais/HospitalForm';

type Hospital = Database['public']['Tables']['hospitais']['Row'];

export default function HospitaisPage() {
  const { user } = useAuth();
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentHospital, setCurrentHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    if (user) {
      fetchHospitais();
    }
  }, [user]);

  const fetchHospitais = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hospital: Hospital | null = null) => {
    setCurrentHospital(hospital);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentHospital(null);
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este hospital?')) return;
    
    try {
      const { error } = await supabase
        .from('hospitais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Hospital excluído com sucesso');
      fetchHospitais();
    } catch (error: any) {
      toast.error('Erro ao excluir hospital', {
        description: error.message,
      });
    }
  };

  const handleSaveHospital = async () => {
    fetchHospitais();
    handleCloseDialog();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hospitais</h1>
          <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Hospital
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : hospitais.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Nenhum hospital cadastrado</h3>
            <p className="mt-1 text-gray-500">Comece adicionando seu primeiro hospital.</p>
            <div className="mt-6">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Hospital
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prazo de Pagamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dia de Corte
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitais.map((hospital) => (
                  <tr key={hospital.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {hospital.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hospital.cnpj || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hospital.prazo_pagamento_dias} dias
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hospital.dia_corte > 0 ? `Dia ${hospital.dia_corte}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(hospital)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHospital(hospital.id)}
                        className="text-red-600 hover:text-red-900"
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentHospital ? 'Editar Hospital' : 'Novo Hospital'}</DialogTitle>
          </DialogHeader>
          <HospitalForm 
            hospital={currentHospital} 
            onSave={handleSaveHospital} 
            onCancel={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
