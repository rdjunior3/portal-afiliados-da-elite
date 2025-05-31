import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Elite Logo Component
const EliteLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 120 120" 
    className={className}
    fill="none"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="50%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Outer Ring */}
    <circle 
      cx="60" 
      cy="60" 
      r="55" 
      stroke="url(#logoGradient)" 
      strokeWidth="3" 
      fill="none"
      opacity="0.3"
    />
    
    {/* Main Logo Circle */}
    <circle 
      cx="60" 
      cy="60" 
      r="45" 
      fill="url(#logoGradient)"
      filter="url(#glow)"
    />
    
    {/* Elite Star/Diamond */}
    <g transform="translate(60,60)">
      {/* Central Diamond */}
      <path 
        d="M-15,-8 L0,-25 L15,-8 L8,0 L15,8 L0,25 L-15,8 L-8,0 Z" 
        fill="#0F172A"
        stroke="#FFF"
        strokeWidth="1"
      />
      
      {/* Inner sparkle */}
      <circle cx="0" cy="0" r="3" fill="#F97316" />
      
      {/* Side sparkles */}
      <circle cx="-8" cy="-8" r="1.5" fill="#FCD34D" opacity="0.8" />
      <circle cx="8" cy="-8" r="1.5" fill="#FCD34D" opacity="0.8" />
      <circle cx="-8" cy="8" r="1.5" fill="#FCD34D" opacity="0.8" />
      <circle cx="8" cy="8" r="1.5" fill="#FCD34D" opacity="0.8" />
    </g>
    
    {/* Orbital elements */}
    <circle cx="20" cy="30" r="2" fill="#FCD34D" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="90" r="1.5" fill="#F97316" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="90" cy="25" r="1" fill="#FCD34D" opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const DashboardLayout: React.FC = () => {
  const { signOut, profile, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Produtos', href: '/dashboard/products', icon: Package },
    { name: 'Aulas', href: '/dashboard/content', icon: BookOpen },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Links', href: '/dashboard/links', icon: LinkIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Comissões', href: '/dashboard/commissions', icon: DollarSign },
    { name: 'Pagamentos', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Notificações', href: '/dashboard/notifications', icon: Bell },
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
      navigate('/login');
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
        "fixed left-0 top-0 z-50 h-screen w-72 transform bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-800/50 px-6">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <EliteLogo className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Afiliados Elite</h1>
                <p className="text-xs text-slate-400">Portal Premium</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="border-b border-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-900" />
                </div>
                <div className="absolute -bottom-1 -right-1">
                  {profile?.affiliate_status === 'approved' && (
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getDisplayName()}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400 truncate">
                    ID: {profile?.affiliate_id || 'Pending'}
                  </p>
                  {profile?.affiliate_status && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs px-1.5 py-0 h-4",
                        profile.affiliate_status === 'approved' 
                          ? 'border-orange-500/50 text-orange-400' 
                          : profile.affiliate_status === 'pending'
                          ? 'border-yellow-500/50 text-yellow-400'
                          : 'border-red-500/50 text-red-400'
                      )}
                    >
                      {profile.affiliate_status === 'approved' ? 'Pro' : 
                       profile.affiliate_status === 'pending' ? 'Pending' : 'Inactive'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
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
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/10"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-orange-400" : "text-slate-400"
                  )} />
                  <span className="flex-1 text-left">{item.name}</span>
                </button>
              );
            })}

            {/* Admin Section */}
            {isAdmin() && (
              <div className="mt-6">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Administração
                </h3>
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
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/10"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-orange-400" : "text-slate-400"
                      )} />
                      <span className="flex-1 text-left">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-slate-800/50 p-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <Home className="h-4 w-4 mr-3" />
              Voltar ao Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-300 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center text-sm text-slate-400">
                <span>Dashboard</span>
                {location.pathname !== '/dashboard' && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="text-white capitalize">
                      {location.pathname.split('/').pop()?.replace('-', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-slate-400">Online</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span>15 cliques hoje</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Wallet className="w-4 h-4 text-orange-400" />
                <span>R$ 240,00 este mês</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 