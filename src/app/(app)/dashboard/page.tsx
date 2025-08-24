'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-bypass';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await authClient.auth.getUser();
        
        if (!user) {
          // Se não houver usuário, redirecionar para login
          router.push('/auth/login');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authClient.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Dados simulados para o dashboard
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const dashboardData = {
    totalPlantoes: 12,
    totalRecebido: 8500,
    totalPrevisto: 4200,
    totalAtrasado: 1500,
    plantoesMes: [
      { id: 1, hospital: 'Hospital São Lucas', data: '05/08/2023', valor: 1200, status: 'Recebido' },
      { id: 2, hospital: 'Hospital Santa Maria', data: '10/08/2023', valor: 1500, status: 'Recebido' },
      { id: 3, hospital: 'Clínica Vida', data: '15/08/2023', valor: 800, status: 'Previsto' },
      { id: 4, hospital: 'Hospital Regional', data: '22/08/2023', valor: 1200, status: 'Lançado' },
    ],
    proximosRecebimentos: [
      { id: 1, hospital: 'Hospital Santa Maria', data: '05/09/2023', valor: 1500 },
      { id: 2, hospital: 'Clínica Vida', data: '10/09/2023', valor: 800 },
    ],
    hospitais: [
      { id: 1, nome: 'Hospital São Lucas', plantoes: 5, valorTotal: 6000 },
      { id: 2, nome: 'Hospital Santa Maria', plantoes: 4, valorTotal: 6000 },
      { id: 3, nome: 'Clínica Vida', plantoes: 2, valorTotal: 1600 },
      { id: 4, nome: 'Hospital Regional', plantoes: 1, valorTotal: 1200 },
    ]
  };
  
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header simplificado */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-emerald-100 text-sm">Olá, {user?.user_metadata?.nome || 'Médico'}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Resumo em cards com indicadores visuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-emerald-500 transform transition-all hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Plantões</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalPlantoes}</p>
                <p className="text-xs text-gray-500">neste mês</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 transform transition-all hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Recebido</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalRecebido)}</p>
                <p className="text-xs text-gray-500">neste mês</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500 transform transition-all hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">A Receber</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalPrevisto)}</p>
                <p className="text-xs text-gray-500">previsão</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500 transform transition-all hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pagamentos Atrasados</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalAtrasado)}</p>
                <p className="text-xs text-gray-500">a regularizar</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seção principal com grid responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Plantões do mês */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Plantões de {currentMonth} de {currentYear}
                </h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.plantoesMes.map((plantao) => (
                        <tr key={plantao.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plantao.hospital}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plantao.data}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(plantao.valor)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              plantao.status === 'Recebido' ? 'bg-green-100 text-green-800' :
                              plantao.status === 'Previsto' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {plantao.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-center">
                  <Link href="/plantoes">
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      Ver todos os plantões
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Gráfico de barras simplificado */}
            <div className="bg-white rounded-xl shadow-md mt-6 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Hospital</h3>
              <div className="space-y-4">
                {dashboardData.hospitais.map((hospital) => (
                  <div key={hospital.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{hospital.nome}</span>
                      <span className="text-gray-500">{hospital.plantoes} plantões</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full" 
                        style={{ width: `${(hospital.valorTotal / 14800) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">{formatCurrency(hospital.valorTotal)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Coluna 2: Próximos recebimentos e ações rápidas */}
          <div className="space-y-6">
            {/* Próximos recebimentos */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Próximos Recebimentos
                </h2>
              </div>
              <div className="p-6">
                {dashboardData.proximosRecebimentos.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.proximosRecebimentos.map((recebimento) => (
                      <div key={recebimento.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">{recebimento.hospital}</p>
                          <p className="text-sm text-gray-500">{recebimento.data}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{formatCurrency(recebimento.valor)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Nenhum recebimento previsto</p>
                )}
              </div>
            </div>
            
            {/* Ações rápidas */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/plantoes/novo" className="w-full">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center py-6 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Novo Plantão
                  </Button>
                </Link>
                <Link href="/hospitais/novo" className="w-full">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center py-6 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Novo Hospital
                  </Button>
                </Link>
                <Link href="/calendario" className="w-full">
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center py-6 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendário
                  </Button>
                </Link>
                <Link href="/historico" className="w-full">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center py-6 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Relatórios
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Informações do usuário */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Seu Perfil</h3>
                <Link href="/perfil">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-gray-500 w-24">Nome:</span>
                  <span className="font-medium">{user?.user_metadata?.nome || 'Não informado'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24">CPF:</span>
                  <span className="font-medium">{user?.user_metadata?.cpf || 'Não informado'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24">Especialidade:</span>
                  <span className="font-medium">{user?.user_metadata?.especialidade || 'Não informado'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}