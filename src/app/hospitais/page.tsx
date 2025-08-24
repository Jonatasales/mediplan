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

export default function HospitaisPage() {
  const [loading, setLoading] = useState(true);
  const [hospitais, setHospitais] = useState<any[]>([]);
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
        const { data: hospitaisData, error } = await authClient.from('hospitais')
          .select('*')
          .eq('profissional_id', user.id)
          .order('nome');
        
        if (error) {
          console.error('Erro ao carregar hospitais:', error);
          toast.error('Erro ao carregar hospitais');
        } else {
          setHospitais(hospitaisData || []);
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
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <Link href="/hospitais/novo">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Hospital
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Meus Hospitais</CardTitle>
            <CardDescription>Visualize e gerencie todos os hospitais e clínicas cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {hospitais.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade/UF</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Padrão</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hospitais.map((hospital) => (
                      <tr key={hospital.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {hospital.nome}
                          {hospital.cnpj && <div className="text-xs text-gray-500">CNPJ: {hospital.cnpj}</div>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hospital.cidade ? (
                            <>
                              {hospital.cidade}
                              {hospital.estado && <span>, {hospital.estado}</span>}
                            </>
                          ) : (
                            'Não informado'
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hospital.telefone && <div>{hospital.telefone}</div>}
                          {hospital.email && <div className="text-xs">{hospital.email}</div>}
                          {!hospital.telefone && !hospital.email && 'Não informado'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(hospital.valor_padrao)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/hospitais/${hospital.id}`}>
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
                <p className="text-gray-500 mb-4">Você ainda não possui hospitais cadastrados.</p>
                <Link href="/hospitais/novo">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Hospital
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