'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  FileText, 
  Building2, 
  User,
  LogOut
} from 'lucide-react';
import { authClient } from '@/lib/auth-bypass';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authClient.auth.signOut();
      toast.success('Logout realizado com sucesso!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1000);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Calendário',
      href: '/calendario',
      icon: Calendar
    },
    {
      name: 'Histórico',
      href: '/historico',
      icon: Clock
    },
    {
      name: 'Relatórios',
      href: '/historico',
      icon: FileText
    },
    {
      name: 'Hospitais',
      href: '/hospitais',
      icon: Building2
    },
    {
      name: 'Perfil',
      href: '/perfil',
      icon: User
    }
  ];

  return (
    <div className={cn('flex flex-col h-screen border-r bg-white', className)}>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center">
          <h1 className="text-2xl font-bold text-emerald-600">medplan</h1>
        </Link>
      </div>
      <div className="flex-1 px-6 space-y-1">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center py-3 px-3 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <item.icon className={cn('h-5 w-5 mr-3', isActive ? 'text-emerald-600' : 'text-gray-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-6 mt-auto border-t">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center w-full py-3 px-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-400" />
          Sair
        </button>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
