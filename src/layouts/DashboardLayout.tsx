import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EliteLogo from '@/components/ui/EliteLogo';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  DollarSign, 
  Package, 
  Settings, 
  LogOut,
  User,
  BarChart3,
  FileText,
  CreditCard,
  Bell,
  Menu,
  X,
  Home,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  ChevronDown,
  Shield,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
  isNew?: boolean;
}

const DashboardLayout: React.FC = () => {
  const { signOut, profile, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Produtos', href: '/dashboard/products', icon: Package },
    { name: 'Aulas', href: '/dashboard/content', icon: BookOpen },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare, badge: 'Novo' },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  ];

  // Admin navigation items
  const adminNavigation = [
    { name: 'Gerenciar Afiliados', href: '/dashboard/admin/affiliates', icon: Users },
    { name: 'Gerenciar Produtos', href: '/dashboard/admin/products', icon: Package },
    { name: 'Gerenciar Conteúdo', href: '/dashboard/admin/content', icon: BookOpen },
    { name: 'Gerenciar Comissões', href: '/dashboard/admin/commissions', icon: DollarSign },
    { name: 'Gerenciar Pagamentos', href: '/dashboard/admin/payments', icon: CreditCard },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'Afiliado';
  };

  const isActivePath = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-80 transform bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-800/95 backdrop-blur-xl border-r border-orange-500/20 transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl shadow-orange-500/10",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header com novo logo */}
          <div className="flex h-20 items-center justify-between border-b border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-600/10 px-6">
            <EliteLogo size="sm" showText={true} animated={true} />
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-400 hover:text-white hover:bg-orange-500/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info melhorado */}
          <div className="border-b border-orange-500/20 bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 border-2 border-orange-300/30">
                  <span className="text-sm font-bold text-white">🏆</span>
                </div>
                <div className="absolute -bottom-1 -right-1">
                  {profile?.affiliate_status === 'approved' && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {getDisplayName()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-orange-300 truncate font-medium">
                    ID: {profile?.affiliate_id || 'Pendente'}
                  </p>
                  {profile?.affiliate_status && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-0.5 h-5 font-bold border-2",
                        profile.affiliate_status === 'approved' 
                          ? 'border-orange-400 text-orange-300 bg-orange-500/10' 
                          : profile.affiliate_status === 'pending'
                          ? 'border-yellow-400 text-yellow-300 bg-yellow-500/10'
                          : 'border-red-400 text-red-300 bg-red-500/10'
                      )}
                    >
                      {profile.affiliate_status === 'approved' ? 'ELITE' : 
                       profile.affiliate_status === 'pending' ? 'PENDENTE' : 'INATIVO'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation melhorada */}
          <nav className="flex-1 space-y-2 p-6 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActivePath(item.href);
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-300 shadow-lg shadow-orange-500/20 border border-orange-400/30"
                      : "text-slate-300 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-orange-600/5 hover:text-white hover:border hover:border-orange-500/20"
                  )}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-orange-400" : "text-slate-400 group-hover:text-orange-400"
                  )} />
                  <span className="flex-1 text-left relative z-10">{item.name}</span>
                  {item.badge && (
                    <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 relative z-10">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}

            {/* Admin Section melhorada */}
            {isAdmin() && (
              <div className="mt-8">
                <div className="flex items-center gap-2 px-4 mb-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent flex-1" />
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent flex-1" />
                </div>
                {adminNavigation.map((item) => {
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-purple-500/30 to-purple-600/20 text-purple-300 shadow-lg shadow-purple-500/20 border border-purple-400/30"
                          : "text-slate-300 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-600/5 hover:text-white hover:border hover:border-purple-500/20"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                        isActive ? "text-purple-400" : "text-slate-400 group-hover:text-purple-400"
                      )} />
                      <span className="flex-1 text-left relative z-10">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Footer Actions melhorado */}
          <div className="border-t border-orange-500/20 bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border hover:border-orange-500/20 transition-all duration-200"
            >
              <Home className="h-4 w-4 mr-3" />
              Voltar ao Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Bar melhorada */}
        <header className="sticky top-0 z-30 border-b border-orange-500/20 bg-slate-900/90 backdrop-blur-xl shadow-lg shadow-orange-500/5">
          <div className="flex h-18 items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-300 hover:text-white hover:bg-orange-500/10 transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Breadcrumb melhorado */}
              <div className="hidden sm:flex items-center text-sm">
                <span className="text-orange-400 font-semibold flex items-center gap-1">
                  <span className="text-xs">🏆</span> Dashboard
                </span>
                {location.pathname !== '/dashboard' && (
                  <>
                    <span className="mx-3 text-orange-500">/</span>
                    <span className="text-white capitalize font-medium">
                      {location.pathname.split('/').pop()?.replace('-', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Notifications melhoradas */}
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="text-slate-300 hover:text-white relative hover:bg-orange-500/10 transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </Button>
              
              {/* Notifications Dropdown melhorado */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-3 w-96 bg-slate-800/95 backdrop-blur-xl border border-orange-500/20 rounded-xl shadow-2xl shadow-orange-500/10 z-50">
                  <div className="p-4 border-b border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <span className="text-sm">🏆</span>
                      Notificações Elite
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">Nova comissão disponível</p>
                          <p className="text-xs text-orange-300 mt-1">Você ganhou R$ 25,00 em comissões</p>
                          <p className="text-xs text-slate-500 mt-1">há 2 horas</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">📚 Novo produto disponível</p>
                          <p className="text-xs text-slate-400 mt-1">Confira o novo curso lançado</p>
                          <p className="text-xs text-slate-500 mt-1">há 5 horas</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-slate-700/30 cursor-pointer transition-colors duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">🎯 Meta mensal atingida</p>
                          <p className="text-xs text-slate-400 mt-1">Parabéns! Você bateu sua meta</p>
                          <p className="text-xs text-slate-500 mt-1">ontem</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-orange-500/20">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all duration-200"
                      onClick={() => {
                        navigate('/dashboard/notifications');
                        setNotificationsOpen(false);
                      }}
                    >
                      Ver todas as notificações
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 