'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-bypass';
import { Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function NovoPlantaoPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hospitais, setHospitais] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    hospital_id: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    valor: '',
    observacoes: '',
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
        
        // Carregar hospitais do usuário
        const { data: hospitaisData, error } = await authClient.from('hospitais')
          .select('*')
          .eq('profissional_id', user.id);
        
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, data: formattedDate }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validação básica
      if (!formData.hospital_id || !formData.data || !formData.hora_inicio || !formData.hora_fim || !formData.valor) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setSubmitting(false);
        return;
      }

      // Converter valor para número
      const valorNumerico = parseFloat(formData.valor.replace(',', '.'));
      
      // Inserir plantão
      const { data, error } = await authClient.from('plantoes').insert([
        {
          profissional_id: user.id,
          hospital_id: formData.hospital_id,
          data: formData.data,
          hora_inicio: formData.hora_inicio,
          hora_fim: formData.hora_fim,
          valor: valorNumerico,
          observacoes: formData.observacoes || null,
          status: 'lançado',
        }
      ]);

      if (error) {
        console.error('Erro ao cadastrar plantão:', error);
        toast.error('Erro ao cadastrar plantão');
      } else {
        toast.success('Plantão cadastrado com sucesso!');
        setTimeout(() => {
          router.push('/plantoes');
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
            <CardTitle className="text-2xl">Novo Plantão</CardTitle>
            <CardDescription>Registre um novo plantão no sistema</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hospital_id">Hospital</Label>
                {hospitais.length > 0 ? (
                  <Select 
                    onValueChange={(value) => handleSelectChange('hospital_id', value)}
                    value={formData.hospital_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitais.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-gray-500">Nenhum hospital cadastrado.</p>
                    <Link href="/hospitais/novo">
                      <Button type="button" variant="outline" size="sm">
                        Cadastrar Hospital
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data do Plantão</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora de Início</Label>
                  <Input
                    id="hora_inicio"
                    name="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fim">Hora de Término</Label>
                  <Input
                    id="hora_fim"
                    name="hora_fim"
                    type="time"
                    value={formData.hora_fim}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="text"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Input
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Adicione observações sobre o plantão"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/plantoes">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Plantão'
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
