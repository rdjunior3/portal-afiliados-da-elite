import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Menu,
  Bell,
  LogOut,
  Sparkles,
  DollarSign,
  Trophy,
  Check
} from 'lucide-react';

const TrophyIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill={color} viewBox="0 0 24 24">
    <rect x="7" y="19" width="10" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
    <rect x="8" y="18.5" width="8" height="1" fill="rgba(0,0,0,0.2)"/>
    <rect x="10.5" y="16" width="3" height="3" fill={color}/>
    <path d="M6 4C6 3.45 6.45 3 7 3H17C17.55 3 18 3.45 18 4V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9V4Z" fill={color}/>
    <ellipse cx="5" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="19" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="5" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    <ellipse cx="19" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    <text x="12" y="11" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="rgba(255,255,255,0.95)">1</text>
    <polygon points="12,6 12.1,6.4 12.5,6.4 12.2,6.7 12.3,7.1 12,6.9 11.7,7.1 11.8,6.7 11.5,6.4 11.9,6.4" fill="rgba(255,255,255,0.9)" />
  </svg>
);

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

  const adminNavigation = [
    { name: 'Gerenciar Afiliados', href: '/dashboard/admin/affiliates', icon: Users, disabled: true },
    { name: 'Gerenciar Produtos', href: '/dashboard/admin/products', icon: Package, disabled: true },
    { name: 'Gerenciar Conteúdo', href: '/dashboard/admin/content', icon: BookOpen, disabled: true },
    { name: 'Integrações', href: '/dashboard/admin/integrations', icon: Settings, disabled: true },
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: "Não foi possível fazer logout. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Até a próxima!",
        });
      }
      
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      console.error('Erro durante logout:', error);
      toast({
        title: "Logout forçado",
        description: "Sua sessão foi encerrada.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.href = '/';
      }, 500);
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
        sidebarCollapsed ? "w-16 lg:w-20" : "w-72 lg:w-80",
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
                    <TrophyIcon className="w-5 h-5 lg:w-6 lg:h-6" color="#1e293b" />
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {profile?.affiliate_status === 'approved' && (
                      <div className="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                        <Sparkles className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-bold text-white truncate">
                    {getDisplayName()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-400 truncate">
                      ID: {profile?.affiliate_id || 'Pendente'}
                    </p>
                    {profile?.affiliate_status && (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5 h-4 lg:h-5 font-bold border",
                          profile.affiliate_status === 'approved' 
                            ? 'border-orange-400/60 text-orange-200 bg-orange-500/20' 
                            : profile.affiliate_status === 'pending'
                            ? 'border-yellow-400/60 text-yellow-200 bg-yellow-500/20'
                            : 'border-red-400/60 text-red-200 bg-red-500/20'
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
          )}

          {sidebarCollapsed && (
            <div className="border-b border-slate-700/50 p-3 lg:p-4 flex justify-center">
              <div className="relative">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-orange-300/20">
                  <TrophyIcon className="w-4 h-4 lg:w-5 lg:h-5" color="#1e293b" />
                </div>
                {profile?.affiliate_status === 'approved' && (
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full border border-slate-900"></div>
                )}
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1 lg:space-y-2 p-3 lg:p-4 overflow-y-auto">
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
                </button>
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
                    <div key={item.name}>
                      {sidebarCollapsed ? (
                        <div
                          className={cn(
                            "flex items-center justify-center p-2 lg:p-3 rounded-lg transition-all duration-200 mb-2 cursor-not-allowed opacity-50",
                            "bg-slate-700/30 text-slate-500"
                          )}
                          title={`${item.name} (Em breve)`}
                        >
                          <item.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 rounded-lg transition-all duration-200 mb-2 cursor-not-allowed opacity-50",
                            "bg-slate-700/30 text-slate-500 hover:bg-slate-700/40"
                          )}
                        >
                          <item.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span className="font-medium text-xs lg:text-sm">{item.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs bg-slate-600/50 text-slate-400 border-slate-600 px-1.5 py-0.5">
                            Em breve
                          </Badge>
                        </div>
                      )}
                    </div>
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

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-16 xl:pl-20" : "lg:pl-72 xl:pl-80")}>
        <header className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-lg">
          <div className="flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 h-8 w-8 p-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div className="lg:hidden">
                <EliteLogo size="sm" showText={false} animated={true} />
              </div>
              
              <div className="hidden lg:flex items-center text-sm">
                <span className="text-orange-300 font-semibold flex items-center gap-1">
                  Dashboard
                </span>
                {location.pathname !== '/dashboard' && (
                  <>
                    <span className="mx-3 text-slate-500">/</span>
                    <span className="text-slate-200 capitalize font-medium">
                      {location.pathname.split('/').pop()?.replace('-', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <ThemeToggle />
              
              <div className="relative hidden lg:block" ref={notificationsRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="text-slate-300 hover:text-white relative hover:bg-slate-700/50 transition-all duration-200 h-8 w-8 p-0"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                      <span className="text-xs text-slate-900 font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </span>
                  )}
                </Button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 lg:w-96 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl z-50">
                    <div className="p-4 border-b border-slate-600/50 bg-gradient-to-r from-slate-700/30 to-slate-600/30">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          Notificações Elite
                          {unreadCount > 0 && (
                            <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                              {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </h3>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 h-6 px-2"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar todas
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="space-y-1">
                          {notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "p-3 hover:bg-slate-700/30 transition-colors cursor-pointer border-l-2",
                                !notification.is_read 
                                  ? "border-l-orange-500 bg-slate-700/20" 
                                  : "border-l-transparent"
                              )}
                              onClick={() => {
                                if (!notification.is_read) {
                                  markAsRead(notification.id);
                                }
                                if (notification.action_url) {
                                  window.open(notification.action_url, '_blank');
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-slate-600/30 rounded-lg">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-white truncate">
                                      {notification.title}
                                    </p>
                                    {!notification.is_read && (
                                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 line-clamp-2 mb-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatNotificationTime(notification.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                          <p className="text-sm text-slate-400">Nenhuma notificação no momento</p>
                          <p className="text-xs text-slate-500 mt-1">Suas atualizações aparecerão aqui</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-slate-600/50 bg-gradient-to-r from-slate-700/30 to-slate-600/30">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 transition-all duration-200"
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
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 