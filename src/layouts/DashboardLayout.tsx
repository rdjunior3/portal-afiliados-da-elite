import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInitialSetup } from '@/hooks/useInitialSetup';
import { useNotifications } from '@/hooks/useNotifications';
import ThemeToggle from '@/components/ThemeToggle';
import EliteLogo from '@/components/ui/EliteLogo';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, Menu } from 'lucide-react';
import { Transition } from '@headlessui/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

import { 
  Home,
  Package,
  BookOpen,
  MessageSquare,
  Settings,
  Users,
  Shield,
  ChevronLeft,
  X,
  Bell,
  LogOut,
  Sparkles,
  DollarSign,
  Trophy,
  Check
} from 'lucide-react';
import BrandIcon from '@/components/ui/BrandIcon';

const DashboardLayout: React.FC = () => {
  const { signOut, profile, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Hook de notificações
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Executa a configuração inicial (ex: criar salas de chat padrão para admin)
  useInitialSetup();

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Produtos', href: '/dashboard/products', icon: Package },
    { name: 'Aulas', href: '/dashboard/content', icon: BookOpen },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare, badge: 'Novo' },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  ];

  // Admin navigation - DESABILITADO TEMPORARIAMENTE conforme solicitação
  // Será habilitado futuramente
  const adminNavigation = [
    // { name: 'Gerenciar Afiliados', href: '/admin/affiliates', icon: Users },
    // { name: 'Gerenciar Produtos', href: '/admin/products', icon: Package },
    // { name: 'Gerenciar Comissões', href: '/admin/commissions', icon: DollarSign },
    // { name: 'Gerenciar Conteúdo', href: '/admin/content', icon: BookOpen },
  ];

  const handleSignOut = async () => {
    try {
      console.log('🚪 [DashboardLayout] Iniciando logout...');
      
      const { error } = await signOut();
      
      if (error) {
        console.error('❌ [DashboardLayout] Erro no logout:', error);
        toast({
          title: "Erro ao sair",
          description: "Não foi possível fazer logout. Tente novamente.",
          variant: "destructive",
        });
      } else {
        console.log('✅ [DashboardLayout] Logout bem-sucedido');
        toast({
          title: "Logout realizado",
          description: "Até a próxima!",
        });
        
        // O AuthContext já gerencia o redirecionamento
        // Não fazemos redirecionamento manual aqui para evitar conflitos
      }
      
    } catch (error) {
      console.error('💥 [DashboardLayout] Erro durante logout:', error);
      toast({
        title: "Sessão encerrada",
        description: "Sua sessão foi encerrada por segurança.",
        variant: "destructive",
      });
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'commission':
        return <DollarSign className="h-4 w-4 text-orange-400" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-400" />;
      case 'product':
        return <Package className="h-4 w-4 text-blue-400" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 'system':
        return <Settings className="h-4 w-4 text-slate-400" />;
      default:
        return <Bell className="h-4 w-4 text-orange-400" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'Agora mesmo';
    }
  };

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center gap-x-2">
        <BrandIcon className="h-8 w-auto text-orange-400" />
        <span className="text-white font-bold text-lg">AFILIADOS DA ELITE</span>
      </div>
      <nav className="flex flex-1 flex-col">
        {navigation.map((item) => {
          const isActive = isActivePath(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "w-full flex items-center rounded-lg lg:rounded-xl transition-all duration-200 group relative overflow-hidden",
                sidebarCollapsed ? "justify-center p-2 lg:p-3" : "gap-3 lg:gap-4 px-3 lg:px-4 py-2.5 lg:py-3",
                isActive
                  ? "bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-200 shadow-lg border border-orange-400/20"
                  : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/40 hover:to-slate-600/30 hover:text-white"
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0 transition-colors duration-200",
                isActive ? "text-orange-300" : "text-slate-400 group-hover:text-slate-200"
              )} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-xs lg:text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge className="bg-orange-500 text-white text-xs px-1.5 lg:px-2 py-0.5">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}

        {isAdmin() && (
          <div className="mt-6 lg:mt-8">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 px-3 lg:px-4 mb-3 lg:mb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                  Admin
            </h3>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1" />
              </div>
            )}
            {adminNavigation.map((item) => {
              const isActive = isActivePath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "w-full flex items-center rounded-lg lg:rounded-xl transition-all duration-200 group relative overflow-hidden mb-2",
                    sidebarCollapsed ? "justify-center p-2 lg:p-3" : "gap-3 lg:gap-4 px-3 lg:px-4 py-2.5 lg:py-3",
                    isActive
                      ? "bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-200 shadow-lg border border-orange-400/20"
                      : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/40 hover:to-slate-600/30 hover:text-white"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-orange-300" : "text-slate-400 group-hover:text-slate-200"
                  )} />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left text-xs lg:text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen transform bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 ease-in-out shadow-2xl",
        sidebarCollapsed ? "w-20" : "w-80",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 lg:h-20 items-center justify-between border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50 px-4 lg:px-6">
            {!sidebarCollapsed && <EliteLogo size="sm" showText={true} animated={true} />}
            {sidebarCollapsed && (
              <div className="mx-auto">
                <EliteLogo size="sm" showText={false} animated={true} />
              </div>
            )}
            
            <div className="flex items-center gap-1 lg:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 h-8 w-8 p-0"
                onClick={toggleSidebar}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", sidebarCollapsed && "rotate-180")} />
              </Button>
            <Button
              variant="ghost"
              size="sm"
                className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 p-0"
              onClick={() => setSidebarOpen(false)}
            >
                <X className="h-4 w-4" />
            </Button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-4 lg:p-6">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="relative">
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-orange-300/20">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Foto de perfil"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="#1e293b" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                          <circle cx="12" cy="8" r="1.5" fill="#f97316"/>
                          <circle cx="8.5" cy="10.5" r="0.8" fill="#f97316"/>
                          <circle cx="15.5" cy="10.5" r="0.8" fill="#f97316"/>
                          <circle cx="7" cy="13.5" r="0.6" fill="#f97316"/>
                          <circle cx="17" cy="13.5" r="0.6" fill="#f97316"/>
                        </svg>
                      )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {profile?.affiliate_status === 'approved' && (
                        <div className="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm lg:text-base font-semibold text-white truncate">{getDisplayName()}</h3>
                  <p className="text-xs text-slate-400 capitalize">{profile?.role || 'Afiliado'}</p>
                  {profile?.affiliate_status === 'approved' && (
                    <Badge variant="outline" className="mt-1 border-orange-500/30 text-orange-400 bg-orange-500/10 text-xs px-1.5 py-0.5">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Elite
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="border-b border-slate-700/50 p-3 lg:p-4 flex justify-center">
              <div className="relative">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-orange-300/20">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Foto de perfil"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="#1e293b" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                      <circle cx="12" cy="8" r="1.5" fill="#f97316"/>
                      <circle cx="8.5" cy="10.5" r="0.8" fill="#f97316"/>
                      <circle cx="15.5" cy="10.5" r="0.8" fill="#f97316"/>
                      <circle cx="7" cy="13.5" r="0.6" fill="#f97316"/>
                      <circle cx="17" cy="13.5" r="0.6" fill="#f97316"/>
                    </svg>
                  )}
                </div>
                {profile?.affiliate_status === 'approved' && (
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full border border-slate-900"></div>
                )}
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-2 p-2 lg:p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActivePath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "w-full flex items-center rounded-lg lg:rounded-xl transition-all duration-200 group relative overflow-hidden",
                    sidebarCollapsed ? "justify-center p-2 lg:p-3" : "gap-3 lg:gap-4 px-3 lg:px-4 py-2.5 lg:py-3",
                    isActive
                      ? "bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-200 shadow-lg border border-orange-400/20"
                      : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/40 hover:to-slate-600/30 hover:text-white"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-orange-300" : "text-slate-400 group-hover:text-slate-200"
                  )} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left text-xs lg:text-sm font-medium">{item.name}</span>
                      {item.badge && (
                        <Badge className="bg-orange-500 text-white text-xs px-1.5 lg:px-2 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}

            {isAdmin() && (
              <div className="mt-6 lg:mt-8">
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2 px-3 lg:px-4 mb-3 lg:mb-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                      Admin
                </h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1" />
                  </div>
                )}
                {adminNavigation.map((item) => {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "w-full flex items-center rounded-lg lg:rounded-xl transition-all duration-200 group relative overflow-hidden mb-2",
                        sidebarCollapsed ? "justify-center p-2 lg:p-3" : "gap-3 lg:gap-4 px-3 lg:px-4 py-2.5 lg:py-3",
                        isActivePath(item.href)
                          ? "bg-gradient-to-r from-orange-500/30 to-orange-600/20 text-orange-200 shadow-lg border border-orange-400/20"
                          : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/40 hover:to-slate-600/30 hover:text-white"
                      )}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0 transition-colors duration-200",
                        isActivePath(item.href) ? "text-orange-300" : "text-slate-400 group-hover:text-slate-200"
                      )} />
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left text-xs lg:text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          <div className="border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-3 lg:p-4 space-y-1 lg:space-y-2">
            {!sidebarCollapsed ? (
              <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/40 transition-all duration-200 h-8 lg:h-9 text-xs lg:text-sm"
            >
                  <Home className="h-3 w-3 lg:h-4 lg:w-4 mr-2 lg:mr-3" />
              Voltar ao Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
                  className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200 h-8 lg:h-9 text-xs lg:text-sm"
            >
                  <LogOut className="h-3 w-3 lg:h-4 lg:w-4 mr-2 lg:mr-3" />
                  Sair da Conta
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="w-full justify-center text-slate-300 hover:text-white hover:bg-slate-700/40 transition-all duration-200 p-2 lg:p-3"
                  title="Voltar ao Site"
                >
                  <Home className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-center text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200 p-2 lg:p-3"
                  title="Sair da Conta"
                >
                  <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-80"
      )}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden lg:block text-sm text-slate-400">
              Bem-vindo de volta, <span className="font-semibold text-white">{getDisplayName()}</span>!
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 p-0"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
                    {unreadCount}
                  </span>
                )}
              </Button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Notificações</h3>
                    {notifications.length > 0 && (
                      <Button variant="link" size="sm" className="text-orange-400 p-0 h-auto" onClick={markAllAsRead}>
                        Marcar todas como lidas
                      </Button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {Array.isArray(notifications) && notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={cn(
                            "flex items-start gap-4 p-3 border-b border-slate-700/50 transition-colors",
                            !notif.is_read && "bg-orange-500/5 hover:bg-orange-500/10"
                          )}
                        >
                          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center mt-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{notif.title}</p>
                            <p className="text-sm text-slate-300">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatNotificationTime(notif.created_at)}</p>
                          </div>
                          {!notif.is_read && (
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="p-0 h-6 w-6 self-center"
                               onClick={() => markAsRead(notif.id)}
                               title="Marcar como lida"
                             >
                              <Check className="w-4 h-4 text-green-400" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-400">
                        Nenhuma notificação nova.
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 bg-slate-900/50">
                      <Button variant="link" className="w-full text-slate-300">Ver todas</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-px h-6 bg-slate-700/50" />

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-3">
               <div className="relative">
                 <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-orange-300/20">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Foto de perfil"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="#1e293b" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                        <circle cx="12" cy="8" r="1.5" fill="#f97316"/>
                        <circle cx="8.5" cy="10.5" r="0.8" fill="#f97316"/>
                        <circle cx="15.5" cy="10.5" r="0.8" fill="#f97316"/>
                        <circle cx="7" cy="13.5" r="0.6" fill="#f97316"/>
                        <circle cx="17" cy="13.5" r="0.6" fill="#f97316"/>
                      </svg>
                    )}
                 </div>
                  {profile?.affiliate_status === 'approved' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
               </div>

              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-white">{getDisplayName()}</span>
                <span className="text-xs text-slate-400 capitalize">{profile?.role || 'Afiliado'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 