'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { authClient } from '@/lib/auth-bypass';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await authClient.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden md:block">
        <Sidebar className="w-64" />
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        {/* Header mobile com menu hamburguer */}
        <div className="md:hidden flex items-center border-b bg-white p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold text-emerald-600">medplan</h1>
        </div>
        
        {/* Conteúdo da página */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}