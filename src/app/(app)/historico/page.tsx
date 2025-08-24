'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-bypass';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HistoricoPage() {
  const [loading, setLoading] = useState(true);
  const [plantoes, setPlantoes] = useState<any[]>([]);
  const [hospitais, setHospitais] = useState<Record<string, any>>({});
  const [user, setUser] = useState<any>(null);
  const [mesSelecionado, setMesSelecionado] = useState(getMonth(new Date()));
  const [anoSelecionado, setAnoSelecionado] = useState(getYear(new Date()));
  const router = useRouter();

  // Dados para os selects
  const meses = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];

  const anos = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - 2 + i);

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
        await carregarPlantoes(user.id, mesSelecionado, anoSelecionado);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  // Função para carregar plantões com base no mês e ano selecionados
  const carregarPlantoes = async (userId: string, mes: number, ano: number) => {
    setLoading(true);
    try {
      const dataInicio = startOfMonth(new Date(ano, mes));
      const dataFim = endOfMonth(new Date(ano, mes));
      
      const { data: plantoesData, error } = await authClient.from('plantoes')
        .select('*')
        .eq('profissional_id', userId)
        .gte('data', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data', format(dataFim, 'yyyy-MM-dd'))
        .order('data', { ascending: true });
      
      if (error) {
        console.error('Erro ao carregar plantões:', error);
        toast.error('Erro ao carregar plantões');
      } else {
        setPlantoes(plantoesData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar plantões:', error);
      toast.error('Erro ao carregar plantões');
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a mudança de mês
  const handleMesChange = (value: string) => {
    const mes = parseInt(value);
    setMesSelecionado(mes);
    carregarPlantoes(user.id, mes, anoSelecionado);
  };

  // Função para lidar com a mudança de ano
  const handleAnoChange = (value: string) => {
    const ano = parseInt(value);
    setAnoSelecionado(ano);
    carregarPlantoes(user.id, mesSelecionado, ano);
  };

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

  // Função para calcular totais
  const calcularTotais = () => {
    const totalValor = plantoes.reduce((sum, plantao) => sum + (plantao.valor || 0), 0);
    const totalRecebido = plantoes
      .filter(plantao => plantao.status === 'recebido')
      .reduce((sum, plantao) => sum + (plantao.valor || 0), 0);
    const totalPrevisto = plantoes
      .filter(plantao => plantao.status === 'previsto' || plantao.status === 'lançado')
      .reduce((sum, plantao) => sum + (plantao.valor || 0), 0);
    
    return { totalValor, totalRecebido, totalPrevisto };
  };

  // Função para calcular totais por hospital
  const calcularTotaisPorHospital = () => {
    const totaisPorHospital: Record<string, { plantoes: number, valor: number }> = {};
    
    plantoes.forEach(plantao => {
      const hospitalId = plantao.hospital_id;
      if (!totaisPorHospital[hospitalId]) {
        totaisPorHospital[hospitalId] = { plantoes: 0, valor: 0 };
      }
      totaisPorHospital[hospitalId].plantoes += 1;
      totaisPorHospital[hospitalId].valor += plantao.valor || 0;
    });
    
    return totaisPorHospital;
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

  const totais = calcularTotais();
  const totaisPorHospital = calcularTotaisPorHospital();

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
          <Button variant="outline" className="text-emerald-600 border-emerald-600">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Relatório de Plantões</CardTitle>
            <CardDescription>Visualize seu histórico de plantões por período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select value={mesSelecionado.toString()} onValueChange={handleMesChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value.toString()}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano</label>
                <Select value={anoSelecionado.toString()} onValueChange={handleAnoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Plantões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{plantoes.length}</div>
              <p className="text-sm text-gray-500">
                {meses.find(m => m.value === mesSelecionado)?.label} de {anoSelecionado}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Recebido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totais.totalRecebido)}</div>
              <p className="text-sm text-gray-500">
                {meses.find(m => m.value === mesSelecionado)?.label} de {anoSelecionado}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Previsto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(totais.totalPrevisto)}</div>
              <p className="text-sm text-gray-500">
                {meses.find(m => m.value === mesSelecionado)?.label} de {anoSelecionado}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Hospital */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Distribuição por Hospital</CardTitle>
            <CardDescription>Plantões e valores por hospital no período</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(totaisPorHospital).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(totaisPorHospital).map(([hospitalId, dados]) => (
                  <div key={hospitalId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{getHospitalName(hospitalId)}</span>
                      <span className="text-gray-500">{dados.plantoes} plantões</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full" 
                        style={{ width: `${(dados.valor / totais.totalValor) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">{formatCurrency(dados.valor)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Nenhum plantão registrado no período selecionado.</p>
            )}
          </CardContent>
        </Card>

        {/* Lista de Plantões */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Plantões</CardTitle>
            <CardDescription>
              {plantoes.length > 0 
                ? `${plantoes.length} plantão(ões) em ${meses.find(m => m.value === mesSelecionado)?.label} de ${anoSelecionado}` 
                : 'Nenhum plantão registrado no período selecionado'}
            </CardDescription>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhum plantão registrado no período selecionado.</p>
                <Link href="/plantoes/novo">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Cadastrar Plantão
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