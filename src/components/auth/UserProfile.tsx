import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Users,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
      }
      
      // Força redirecionamento independente de erro
      // Usa setTimeout para garantir que o processo de logout seja concluído
      setTimeout(() => {
        navigate('/', { replace: true });
        // Força reload da página como backup
        window.location.href = '/';
      }, 300);
      
    } catch (error) {
      console.error('Erro durante logout:', error);
      
      // Mesmo com erro, força redirecionamento
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.href = '/';
      }, 300);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user.email?.split('@')[0] || 'Usuário';
  };

  const getAffiliateStatus = () => {
    const status = profile?.affiliate_status || 'pending';
    const statusConfig = {
      pending: { label: 'Pendente', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      approved: { label: 'Aprovado', color: 'text-orange-400', bg: 'bg-orange-400/10' },
      rejected: { label: 'Rejeitado', color: 'text-red-400', bg: 'bg-red-400/10' },
      suspended: { label: 'Suspenso', color: 'text-orange-400', bg: 'bg-orange-400/10' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const userStats = {
    earnings: profile?.total_earnings || 0,
    clicks: profile?.total_clicks || 0,
    conversions: profile?.total_conversions || 0,
    rate: profile?.commission_rate || 10
  };

  const statusInfo = getAffiliateStatus();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-auto px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8 border-2 border-orange-400/30 group-hover:border-orange-400/50 transition-colors">
                <AvatarImage 
                  src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                  alt={getDisplayName()} 
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-slate-900 text-xs font-bold">
                  {getInitials(getDisplayName())}
                </AvatarFallback>
              </Avatar>
              
              <div className={cn(
                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900",
                statusInfo.color.replace('text-', 'bg-')
              )} />
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-white truncate max-w-32">
                {getDisplayName()}
              </div>
              <div className="text-xs text-slate-400">
                {profile?.affiliate_id ? `#${profile.affiliate_id}` : 'Afiliado'}
              </div>
            </div>

            <ChevronDown className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-300",
              isOpen && "rotate-180"
            )} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-orange-400/30">
              <AvatarImage 
                src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                alt={getDisplayName()} 
              />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-slate-900 font-bold">
                {getInitials(getDisplayName())}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white truncate">
                  {getDisplayName()}
                </h3>
                {statusInfo.label === 'Aprovado' && (
                  <Crown className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-slate-400 truncate">{user.email}</p>
              <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1", statusInfo.bg, statusInfo.color)}>
                <Sparkles className="w-3 h-3" />
                {statusInfo.label}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-700/50" />

        {profile?.affiliate_status === 'approved' && (
          <>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-orange-400">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-xs font-medium">Ganhos</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    R$ {userStats.earnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-blue-400">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">Taxa</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {userStats.rate}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-purple-400">
                    <Users className="w-3 h-3" />
                    <span className="text-xs font-medium">Cliques</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {userStats.clicks.toLocaleString('pt-BR')}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-orange-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs font-medium">Conversões</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {userStats.conversions.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
            
            <DropdownMenuSeparator className="bg-slate-700/50" />
          </>
        )}

        <DropdownMenuLabel className="text-slate-400 font-medium">
          Minha Conta
        </DropdownMenuLabel>
        
        <DropdownMenuItem className="cursor-pointer hover:bg-slate-800/50 focus:bg-slate-800/50">
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer hover:bg-slate-800/50 focus:bg-slate-800/50">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-700/50" />
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 