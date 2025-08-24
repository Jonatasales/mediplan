'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-bypass';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { format, parseISO, isEqual, isSameDay } from 'date-fns';

export default function CalendarioPage() {
  const [loading, setLoading] = useState(true);
  const [plantoes, setPlantoes] = useState<any[]>([]);
  const [hospitais, setHospitais] = useState<Record<string, any>>({});
  const [user, setUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plantoesDodia, setPlantoesDodia] = useState<any[]>([]);
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
        
        // Dados simulados para desenvolvimento
        const hospitaisSimulados = [
          { id: '1', nome: 'Hospital São Lucas', profissional_id: user.id },
          { id: '2', nome: 'Hospital Santa Maria', profissional_id: user.id },
          { id: '3', nome: 'Clínica Vida', profissional_id: user.id },
          { id: '4', nome: 'Hospital Regional', profissional_id: user.id }
        ];
        
        const plantoesSimulados = [
          { 
            id: '1', 
            hospital_id: '1', 
            data: '2023-08-05', 
            hora_inicio: '08:00', 
            hora_fim: '20:00', 
            valor: 1200, 
            status: 'recebido',
            profissional_id: user.id 
          },
          { 
            id: '2', 
            hospital_id: '2', 
            data: '2023-08-10', 
            hora_inicio: '20:00', 
            hora_fim: '08:00', 
            valor: 1500, 
            status: 'recebido',
            profissional_id: user.id 
          },
          { 
            id: '3', 
            hospital_id: '3', 
            data: '2023-08-15', 
            hora_inicio: '08:00', 
            hora_fim: '20:00', 
            valor: 800, 
            status: 'previsto',
            profissional_id: user.id 
          },
          { 
            id: '4', 
            hospital_id: '4', 
            data: '2023-08-22', 
            hora_inicio: '20:00', 
            hora_fim: '08:00', 
            valor: 1200, 
            status: 'lançado',
            profissional_id: user.id 
          },
        ];

        try {
          // Carregar hospitais do usuário
          const { data: hospitaisData, error: hospitaisError } = await authClient.from('hospitais')
            .select('*')
            .eq('profissional_id', user.id);
          
          if (hospitaisError) {
            console.error('Erro ao carregar hospitais:', hospitaisError);
            // Usar dados simulados em caso de erro
            const hospitaisMap: Record<string, any> = {};
            hospitaisSimulados.forEach(hospital => {
              hospitaisMap[hospital.id] = hospital;
            });
            setHospitais(hospitaisMap);
          } else {
            const hospitaisMap: Record<string, any> = {};
            hospitaisData?.forEach(hospital => {
              hospitaisMap[hospital.id] = hospital;
            });
            setHospitais(hospitaisMap);
          }
        } catch (error) {
          console.error('Erro ao processar hospitais:', error);
          // Usar dados simulados em caso de erro
          const hospitaisMap: Record<string, any> = {};
          hospitaisSimulados.forEach(hospital => {
            hospitaisMap[hospital.id] = hospital;
          });
          setHospitais(hospitaisMap);
        }
        
        try {
          // Carregar plantões do usuário
          const { data: plantoesData, error: plantoesError } = await authClient.from('plantoes')
            .select('*')
            .eq('profissional_id', user.id);
          
          if (plantoesError) {
            console.error('Erro ao carregar plantões:', plantoesError);
            // Usar dados simulados em caso de erro
            setPlantoes(plantoesSimulados);
            atualizarPlantoesDodia(selectedDate, plantoesSimulados);
          } else {
            setPlantoes(plantoesData || []);
            atualizarPlantoesDodia(selectedDate, plantoesData || []);
          }
        } catch (error) {
          console.error('Erro ao processar plantões:', error);
          // Usar dados simulados em caso de erro
          setPlantoes(plantoesSimulados);
          atualizarPlantoesDodia(selectedDate, plantoesSimulados);
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

  // Função para atualizar os plantões do dia selecionado
  const atualizarPlantoesDodia = (data: Date, listaDePlantoes: any[]) => {
    const plantoesFiltrados = listaDePlantoes.filter(plantao => {
      try {
        const dataPlantao = parseISO(plantao.data);
        return isSameDay(dataPlantao, data);
      } catch (error) {
        return false;
      }
    });
    setPlantoesDodia(plantoesFiltrados);
  };

  // Função para lidar com a mudança de data selecionada
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      atualizarPlantoesDodia(date, plantoes);
    }
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter o nome do hospital pelo ID
  const getHospitalName = (hospitalId: string) => {
    return hospitais[hospitalId]?.nome || 'Hospital não encontrado';
  };

  // Função para verificar se um dia tem plantão
  const temPlantao = (date: Date) => {
    return plantoes.some(plantao => {
      try {
        const dataPlantao = parseISO(plantao.data);
        return isSameDay(dataPlantao, date);
      } catch (error) {
        return false;
      }
    });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Link href="/dashboard" className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Voltar para o Dashboard</span>
          </Link>
          <Link href="/plantoes/novo">
            <Button className="bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
              Novo Plantão
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Plantões</CardTitle>
                <CardDescription>Selecione uma data para ver os plantões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    locale={ptBR}
                    className="rounded-md border mx-auto"
                    modifiers={{
                      highlighted: (date) => temPlantao(date),
                    }}
                    modifiersStyles={{
                      highlighted: { backgroundColor: '#dcfce7' },
                    }}
                    styles={{
                      day_today: { 
                        fontWeight: 'bold', 
                        border: '2px solid #10b981',
                        color: '#10b981'
                      },
                      day_selected: { 
                        backgroundColor: '#10b981', 
                        color: 'white',
                        fontWeight: 'bold'
                      },
                      day: { 
                        width: '40px', 
                        height: '40px', 
                        margin: '2px',
                        borderRadius: '8px'
                      },
                      day_outside: { opacity: 0.5 },
                      day_disabled: { color: '#ccc' },
                      head_cell: { 
                        color: '#10b981',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        padding: '8px 0',
                        textTransform: 'uppercase'
                      },
                      cell: { padding: '2px' },
                      nav_button_previous: { 
                        color: '#10b981',
                        width: '32px',
                        height: '32px'
                      },
                      nav_button_next: { 
                        color: '#10b981',
                        width: '32px',
                        height: '32px'
                      },
                      caption: { 
                        textTransform: 'capitalize',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        padding: '8px 0'
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do dia selecionado */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-xl text-emerald-700">
                  Plantões de {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <CardDescription className="text-emerald-600/70 font-medium">
                  {plantoesDodia.length > 0 
                    ? `${plantoesDodia.length} plantão(ões) neste dia` 
                    : 'Nenhum plantão registrado nesta data'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {plantoesDodia.length > 0 ? (
                  <div className="space-y-4">
                    {plantoesDodia.map((plantao) => (
                      <div key={plantao.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{getHospitalName(plantao.hospital_id)}</h3>
                            <div className="flex items-center mt-2 text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm">
                                {plantao.hora_inicio} - {plantao.hora_fim}
                              </p>
                            </div>
                            {plantao.observacoes && (
                              <div className="flex items-start mt-2 text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <p className="text-sm">
                                  {plantao.observacoes}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-600 text-xl">{formatCurrency(plantao.valor)}</div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(plantao.status)}`}>
                              {plantao.status.charAt(0).toUpperCase() + plantao.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t flex justify-end">
                          <Link href={`/plantoes/${plantao.id}`}>
                            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 flex flex-col items-center">
                    <div className="bg-gray-50 rounded-full p-6 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-6 text-lg">Nenhum plantão registrado para esta data.</p>
                    <Link href="/plantoes/novo">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
                        Adicionar Plantão
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}