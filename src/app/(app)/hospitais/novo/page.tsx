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

export default function NovoHospitalPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    telefone: '',
    email: '',
    valor_padrao: '',
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
        toast.error('Por favor, informe o nome do hospital');
        setSubmitting(false);
        return;
      }

      // Converter valor padrão para número se fornecido
      let valorPadrao = null;
      if (formData.valor_padrao) {
        valorPadrao = parseFloat(formData.valor_padrao.replace(',', '.'));
      }
      
      // Inserir hospital
      const { data, error } = await authClient.from('hospitais').insert([
        {
          profissional_id: user.id,
          nome: formData.nome,
          cnpj: formData.cnpj || null,
          endereco: formData.endereco || null,
          cidade: formData.cidade || null,
          estado: formData.estado || null,
          telefone: formData.telefone || null,
          email: formData.email || null,
          valor_padrao: valorPadrao,
        }
      ]);

      if (error) {
        console.error('Erro ao cadastrar hospital:', error);
        toast.error('Erro ao cadastrar hospital');
      } else {
        toast.success('Hospital cadastrado com sucesso!');
        setTimeout(() => {
          router.push('/hospitais');
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
            <CardTitle className="text-2xl">Novo Hospital</CardTitle>
            <CardDescription>Cadastre um novo hospital ou clínica</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Hospital/Clínica *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Nome do hospital ou clínica"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço (opcional)</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade (opcional)</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado (opcional)</Label>
                  <Input
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone (opcional)</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contato@hospital.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_padrao">Valor Padrão do Plantão (R$) (opcional)</Label>
                <Input
                  id="valor_padrao"
                  name="valor_padrao"
                  value={formData.valor_padrao}
                  onChange={handleInputChange}
                  placeholder="0,00"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/hospitais">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Hospital'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
