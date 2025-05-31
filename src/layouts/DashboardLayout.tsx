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
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
  isNew?: boolean;
}

const DashboardLayout: React.FC = () => {
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems: MenuItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/dashboard'
    },
    { 
      icon: Package, 
      label: 'Produtos', 
      href: '/dashboard/products',
      badge: '12'
    },
    { 
      icon: LinkIcon, 
      label: 'Meus Links', 
      href: '/dashboard/links',
      badge: profile?.links_count?.toString()
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      href: '/dashboard/analytics',
      isNew: true
    },
    { 
      icon: DollarSign, 
      label: 'Comissões', 
      href: '/dashboard/commissions'
    },
    { 
      icon: CreditCard, 
      label: 'Pagamentos', 
      href: '/dashboard/payments'
    },
    { 
      icon: FileText, 
      label: 'Relatórios', 
      href: '/dashboard/reports'
    },
    { 
      icon: User, 
      label: 'Perfil', 
      href: '/dashboard/profile'
    },
    { 
      icon: Bell, 
      label: 'Notificações', 
      href: '/dashboard/notifications',
      badge: '3'
    },
    { 
      icon: Settings, 
      label: 'Configurações', 
      href: '/dashboard/settings'
    }
  ];

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
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM12 4.44L18.18 9H5.82L12 4.44ZM6.09 11H17.91L17.25 19H6.75L6.09 11Z"/>
                    <circle cx="12" cy="14" r="2" fill="#0f172a"/>
                  </svg>
                </div>
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
            {menuItems.map((item) => {
              const isActive = isActivePath(item.href);
              return (
                <button
                  key={item.href}
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
                  <span className="flex-1 text-left">{item.label}</span>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-1">
                    {item.isNew && (
                      <Badge className="bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0 h-4">
                        New
                      </Badge>
                    )}
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="bg-slate-700/50 text-slate-300 text-xs px-1.5 py-0 h-4"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
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