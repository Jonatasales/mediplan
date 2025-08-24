'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-bypass';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PlantoesPage() {
  const [loading, setLoading] = useState(true);
  const [plantoes, setPlantoes] = useState<any[]>([]);
  const [hospitais, setHospitais] = useState<Record<string, any>>({});
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await authClient.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }
        
        setUser(user);
        
        // Carregar hospitais do usuário
        const { data: hospitaisData, error: hospitaisError } = await authClient.from('hospitais')
          .select('*')
          .eq('profissional_id', user.id);
        
        if (hospitaisError) {
          console.error('Erro ao carregar hospitais:', hospitaisError);
        } else {
          const hospitaisMap: Record<string, any> = {};
          hospitaisData?.forEach(hospital => {
            hospitaisMap[hospital.id] = hospital;
          });
          setHospitais(hospitaisMap);
        }
        
        // Carregar plantões do usuário
        const { data: plantoesData, error: plantoesError } = await authClient.from('plantoes')
          .select('*')
          .eq('profissional_id', user.id)
          .order('data', { ascending: false });
        
        if (plantoesError) {
          console.error('Erro ao carregar plantões:', plantoesError);
          toast.error('Erro ao carregar plantões');
        } else {
          setPlantoes(plantoesData || []);
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Função para obter o nome do hospital pelo ID
  const getHospitalName = (hospitalId: string) => {
    return hospitais[hospitalId]?.nome || 'Hospital não encontrado';
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'previsto':
        return 'bg-blue-100 text-blue-800';
      case 'lançado':
        return 'bg-gray-100 text-gray-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="flex items-center text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Voltar para o Dashboard</span>
          </Link>
          <Link href="/plantoes/novo">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plantão
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Meus Plantões</CardTitle>
            <CardDescription>Visualize e gerencie todos os seus plantões</CardDescription>
          </CardHeader>
          <CardContent>
            {plantoes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plantoes.map((plantao) => (
                      <tr key={plantao.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(plantao.data)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getHospitalName(plantao.hospital_id)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {plantao.hora_inicio} - {plantao.hora_fim}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(plantao.valor)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plantao.status)}`}>
                            {plantao.status.charAt(0).toUpperCase() + plantao.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/plantoes/${plantao.id}`}>
                            <Button variant="ghost" size="sm">
                              Detalhes
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Você ainda não possui plantões cadastrados.</p>
                <Link href="/plantoes/novo">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Plantão
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}