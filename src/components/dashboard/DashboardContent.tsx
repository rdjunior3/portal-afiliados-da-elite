import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BrandIcon from '@/components/ui/BrandIcon';
import { 
  Plus,
  Sparkles,
  DollarSign,
  TrendingUp,
  Target,
  ArrowRight,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EliteTipsEditor from '@/components/EliteTipsEditor';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

// ... (Tipos podem ser movidos para um arquivo types.ts dedicado mais tarde)
type ProductWithOffers = any; // Simplificando por agora para focar na estrutura
type Profile = any;
type Tip = any;

interface DashboardContentProps {
  user: User;
  profile: Profile;
  statsCards?: any[];
  platformStats?: any;
  featuredProducts: ProductWithOffers[];
  isLoadingProducts: boolean;
  tips: Tip[];
  tipsLoading: boolean;
  navigate: (path: string) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  user,
  profile,
  statsCards = [],
  platformStats = { totalAffiliates: 0, averageConversion: 0, totalCommissions: 'R$ 0', topProducts: 0 },
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
      title: "Link copiado!",
      description: "O link de promoção foi copiado para sua área de transferência.",
    });
  };

  return (
    <>
      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={index} 
              className={cn(
                "bg-slate-800/60 backdrop-blur border-slate-700/50 shadow-lg",
                `bg-gradient-to-br ${stat.bgClass}`,
                "hover:scale-[1.02] transition-transform duration-300"
              )}
            >
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-xs lg:text-sm font-medium">{stat.title}</p>
                    <p className="text-lg lg:text-2xl font-bold text-white">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-green-400 font-medium mt-1">
                        {stat.change} vs mês anterior
                      </p>
                    )}
                  </div>
                  <div className={`h-8 w-8 lg:h-12 lg:w-12 bg-${stat.color}-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estatísticas da Plataforma */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/60 border-slate-600/50 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">📊</span>
            Estatísticas da Plataforma Elite
          </CardTitle>
          <CardDescription className="text-slate-300">
            Dados em tempo real da nossa comunidade de afiliados elite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
              <div className="text-2xl font-bold text-orange-400">{platformStats.totalAffiliates}</div>
              <div className="text-sm text-slate-300">Afiliados Elite</div>
            </div>
            <div className="text-center p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
              <div className="text-2xl font-bold text-green-400">{platformStats.averageConversion}%</div>
              <div className="text-sm text-slate-300">Taxa Conversão Média</div>
            </div>
            <div className="text-center p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
              <div className="text-2xl font-bold text-blue-400">{platformStats.totalCommissions}</div>
              <div className="text-sm text-slate-300">Comissões Pagas</div>
            </div>
            <div className="text-center p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
              <div className="text-2xl font-bold text-purple-400">{platformStats.topProducts}</div>
              <div className="text-sm text-slate-300">Produtos Premium</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Products Section */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg lg:text-xl font-bold text-white flex items-center gap-1 lg:gap-2">
                  <span>Produtos Elite em Destaque</span>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/products')}
                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 backdrop-blur-sm flex items-center gap-1 lg:gap-2 text-xs lg:text-sm"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
              <CardDescription className="text-slate-300 text-xs lg:text-sm">
                Explore nossos produtos premium e copie seus links de afiliação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingProducts ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
                      <div className="h-40 bg-slate-700/50 rounded-md"></div>
                      <div className="h-6 bg-slate-700/50 rounded-md mt-4 w-3/4"></div>
                      <div className="h-4 bg-slate-700/50 rounded-md mt-2 w-1/2"></div>
                    </div>
                  ))
                ) : (
                  Array.isArray(featuredProducts) && featuredProducts.map((product) => (
                    <div key={product.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 p-4 rounded-xl shadow-lg hover:shadow-cyan-500/10 transition-shadow duration-300">
                      <img src={product.image_url || '/placeholder.png'} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4" />
                      <h3 className="text-lg font-bold text-cyan-400">{product.name}</h3>
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">{product.description}</p>
                      <div className="mt-2 space-y-1">
                        {Array.isArray(product.product_offers) && product.product_offers.map((offer: any) => (
                          <div key={offer.id} className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded-full">
                            {offer.name} - Comissão: R$ {offer.commission_value}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8">
          {/* Profile Status */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                Seu Perfil Elite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Foto de perfil"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                                          <BrandIcon className="w-6 h-6 lg:w-8 lg:h-8 text-slate-100" />
                  )}
                </div>
                <h3 className="text-white font-bold text-base lg:text-lg">{getDisplayName()}</h3>
                <p className="text-orange-300 font-medium text-sm lg:text-base">Afiliado Elite</p>
              </div>
              <div className="space-y-2 lg:space-y-3 mt-4 lg:mt-6">
                <div className="flex items-center justify-between p-2 lg:p-3 bg-slate-700/40 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                  <span className="text-slate-300 text-xs lg:text-sm">ID Afiliado</span>
                  <span className="text-orange-200 font-bold text-xs lg:text-sm">
                    {profile?.affiliate_id || 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 lg:p-3 bg-slate-700/40 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                  <span className="text-slate-300 text-xs lg:text-sm">Status</span>
                  <Badge className={cn(
                    "text-xs",
                    profile?.affiliate_status === 'approved' 
                      ? "bg-orange-500/80 text-white backdrop-blur-sm"
                      : "bg-yellow-500/80 text-white backdrop-blur-sm"
                  )}>
                    {profile?.affiliate_status === 'approved' ? 'Elite' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-orange-500/15 to-orange-600/10 border-orange-500/30 backdrop-blur-sm shadow-lg shadow-orange-500/10">
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-sm lg:text-base">💡</span>
                  Dicas Elite
                </CardTitle>
                {isAdmin() && <EliteTipsEditor />}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4 text-xs lg:text-sm">
              {tipsLoading ? (
                <div className="flex items-center justify-center py-6 lg:py-8">
                  <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-b-2 border-orange-400"></div>
                </div>
              ) : tips.length > 0 ? (
                tips.map((tip) => (
                  <div key={tip.id} className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg backdrop-blur-sm">
                    <span className="text-sm lg:text-base">{tip.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-200 font-medium mb-1 text-xs lg:text-sm">{tip.title}</h4>
                      <p className="text-slate-200 leading-relaxed text-xs lg:text-sm">{tip.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 lg:py-8 text-slate-400">
                  <span className="text-xl lg:text-2xl">💡</span>
                  <p className="mt-2 text-xs lg:text-sm">Nenhuma dica disponível no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
