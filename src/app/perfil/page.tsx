'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-bypass';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [perfilData, setPerfilData] = useState<any>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    conselho_classe: '',
    numero_registro: '',
    especialidade: '',
    telefone: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await authClient.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }
        
        setUser(user);
        
        // Carregar dados do perfil
        const { data: perfilData, error } = await authClient.from('profissionais_saude')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao carregar perfil:', error);
          toast.error('Erro ao carregar dados do perfil');
        } else if (perfilData) {
          setPerfilData(perfilData);
          setFormData({
            nome: perfilData.nome || '',
            cpf: perfilData.cpf || '',
            conselho_classe: perfilData.conselho_classe || '',
            numero_registro: perfilData.numero_registro || '',
            especialidade: perfilData.especialidade || '',
            telefone: perfilData.telefone || '',
          });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validação básica
      if (!formData.nome) {
        toast.error('Por favor, informe seu nome');
        setSubmitting(false);
        return;
      }

      // Atualizar perfil
      const { data, error } = await authClient.from('profissionais_saude').update({
        nome: formData.nome,
        cpf: formData.cpf || null,
        conselho_classe: formData.conselho_classe || null,
        numero_registro: formData.numero_registro || null,
        especialidade: formData.especialidade || null,
        telefone: formData.telefone || null,
      }).eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil');
      } else {
        // Atualizar metadados do usuário
        const { error: userError } = await authClient.auth.updateUser({
          data: {
            nome: formData.nome,
            cpf: formData.cpf,
            especialidade: formData.especialidade,
          }
        });

        if (userError) {
          console.error('Erro ao atualizar metadados do usuário:', userError);
        }

        toast.success('Perfil atualizado com sucesso!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast.error('Erro ao processar formulário');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Voltar para o Dashboard</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Meu Perfil</CardTitle>
            <CardDescription>Atualize seus dados pessoais e profissionais</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conselho_classe">Conselho de Classe</Label>
                  <Input
                    id="conselho_classe"
                    name="conselho_classe"
                    value={formData.conselho_classe}
                    onChange={handleInputChange}
                    placeholder="CRM, COREN, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_registro">Número de Registro</Label>
                  <Input
                    id="numero_registro"
                    name="numero_registro"
                    value={formData.numero_registro}
                    onChange={handleInputChange}
                    placeholder="Número do registro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input
                    id="especialidade"
                    name="especialidade"
                    value={formData.especialidade}
                    onChange={handleInputChange}
                    placeholder="Sua especialidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/dashboard">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Segurança</CardTitle>
            <CardDescription>Gerencie sua senha e configurações de segurança</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
