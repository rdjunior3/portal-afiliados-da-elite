import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  Copy,
  Sparkles,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

type ProductWithOffers = any;
type Profile = any;
type Tip = any;

interface ModernDashboardContentProps {
  user: User;
  profile: Profile;
  featuredProducts: ProductWithOffers[];
  isLoadingProducts: boolean;
  tips: Tip[];
  tipsLoading: boolean;
  navigate: (path: string) => void;
}

export const ModernDashboardContent: React.FC<ModernDashboardContentProps> = ({
  user,
  profile,
  featuredProducts,
  isLoadingProducts,
  tips,
  tipsLoading,
  navigate
}) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();

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
    return user.email?.split('@')[0] || 'Afiliado';
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado! ✨",
      description: "O link de promoção foi copiado para sua área de transferência.",
    });
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Vendas Este Mês',
      value: 'R$ 12.540',
      change: '+23.5%',
      icon: DollarSign,
      color: 'emerald',
      bgClass: 'from-emerald-600/20 to-emerald-800/20',
      trend: 'up' as const
    },
    {
      title: 'Comissões Ganhas',
      value: 'R$ 3.762',
      change: '+18.2%',
      icon: TrendingUp,
      color: 'blue',
      bgClass: 'from-blue-600/20 to-blue-800/20',
      trend: 'up' as const
    },
    {
      title: 'Cliques Únicos',
      value: '1.234',
      change: '+12.1%',
      icon: Target,
      color: 'purple',
      bgClass: 'from-purple-600/20 to-purple-800/20',
      trend: 'up' as const
    },
    {
      title: 'Taxa Conversão',
      value: '4.8%',
      change: '+0.8%',
      icon: Zap,
      color: 'orange',
      bgClass: 'from-orange-600/20 to-orange-800/20',
      trend: 'up' as const
    }
  ];

  const platformStats = {
    totalAffiliates: 247,
    averageConversion: 4.2,
    totalCommissions: 'R$ 847.320',
    topProducts: 18
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-500/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-8 w-8 text-yellow-400" />
            <Badge className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 border-yellow-400/30">
              Elite Member
            </Badge>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Olá, <span className="bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">{getDisplayName()}</span>! 👋
          </h1>
          
          <p className="text-xl text-slate-300 mb-6 max-w-2xl">
            Bem-vindo ao seu portal elite de afiliados. Monitore suas vendas, comissões e descubra novos produtos premium.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
              onClick={() => navigate('/dashboard/products')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Explorar Produtos
            </Button>
            
            {isAdmin && (
              <Button 
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300"
                onClick={() => navigate('/admin/products')}
              >
                <Crown className="h-5 w-5 mr-2" />
                Painel Admin
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={index} 
              className={cn(
                "relative overflow-hidden bg-slate-900/60 border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-600/50 group"
              )}
            >
              {/* Gradient background */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", stat.bgClass)}></div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white mt-2">{stat.value}</p>
                    {stat.change && (
                      <p className="text-sm text-emerald-400 font-medium mt-2 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change} vs mês anterior
                      </p>
                    )}
                  </div>
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    `bg-${stat.color}-500/20 group-hover:bg-${stat.color}-500/30`
                  )}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Stats */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-600/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-orange-500/5"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-r from-cyan-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            Estatísticas da Plataforma Elite
          </CardTitle>
          <CardDescription className="text-slate-300">
            Dados em tempo real da nossa comunidade de afiliados premium
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:bg-slate-700/40 transition-colors duration-300">
              <div className="text-3xl font-bold text-cyan-400 mb-1">{platformStats.totalAffiliates}</div>
              <div className="text-sm text-slate-300">Afiliados Elite</div>
            </div>
            <div className="text-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:bg-slate-700/40 transition-colors duration-300">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{platformStats.averageConversion}%</div>
              <div className="text-sm text-slate-300">Taxa Conversão</div>
            </div>
            <div className="text-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:bg-slate-700/40 transition-colors duration-300">
              <div className="text-3xl font-bold text-blue-400 mb-1">{platformStats.totalCommissions}</div>
              <div className="text-sm text-slate-300">Comissões Pagas</div>
            </div>
            <div className="text-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:bg-slate-700/40 transition-colors duration-300">
              <div className="text-3xl font-bold text-purple-400 mb-1">{platformStats.topProducts}</div>
              <div className="text-sm text-slate-300">Produtos Premium</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Produtos Elite em Destaque
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/products')}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300"
                >
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-slate-300">
                Explore nossa seleção premium de produtos com altas comissões.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoadingProducts ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
                      <div className="h-32 bg-slate-700/50 rounded-lg mb-4"></div>
                      <div className="h-5 bg-slate-700/50 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  Array.isArray(featuredProducts) && featuredProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="group bg-gradient-to-br from-slate-800/80 to-slate-900/60 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]">
                      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4">
                        <img 
                          src={product.image_url || '/placeholder.svg'} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(product.product_offers) && product.product_offers.slice(0, 1).map((offer: any) => (
                            <Badge key={offer.id} className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                              R$ {offer.commission_value}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyLink(product.sales_page_url || '#')}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Status */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                Status Elite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{getDisplayName()}</h3>
                <Badge className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 border-yellow-400/30 mb-4">
                  Membro Elite
                </Badge>
                <p className="text-sm text-slate-400">
                  Membro desde {new Date(user.created_at || '').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Elite Tips */}
          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-400" />
                Dicas Elite
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tipsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tips.slice(0, 3).map((tip, index) => (
                    <div key={index} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors duration-300">
                      <h4 className="text-sm font-medium text-white mb-1">{tip.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{tip.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboardContent; 