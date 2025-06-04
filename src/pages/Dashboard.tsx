import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useEliteTips } from '@/hooks/useEliteTips';
import { LoadingScreen } from '@/components/ui/loading';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Sparkles,
  DollarSign,
  TrendingUp,
  Target,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateLinkModal from '@/components/CreateLinkModal';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { EliteCard, EliteGrid, EliteText, EliteButton, EliteBadge } from '@/lib/elite-styles';
import { cn } from '@/lib/utils';
import EliteTipsEditor from '@/components/EliteTipsEditor';

type Product = Tables<'products'> & {
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

const Dashboard = () => {
  const { user, profile, loading, isAdmin } = useAuth();
  const { featuredProducts, isLoadingProducts } = useProducts();
  const { tips, loading: tipsLoading } = useEliteTips();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [createLinkModal, setCreateLinkModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null
  });

  const openCreateLinkModal = (product: Product) => {
    setCreateLinkModal({
      isOpen: true,
      product
    });
  };

  const closeCreateLinkModal = () => {
    setCreateLinkModal({
      isOpen: false,
      product: null
    });
  };

  if (loading) {
    return <LoadingScreen message="Carregando seu dashboard elite..." />;
  }

  if (!user) {
    navigate('/');
    return null;
  }

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

  // Stats Cards Data
  const statsCards = [
    {
      title: 'Status Elite',
      value: profile?.affiliate_status === 'approved' ? 'ATIVO' : 'PENDENTE',
      icon: Sparkles,
      color: 'orange',
      bgClass: 'from-orange-500/20 to-orange-600/10 border-orange-500/30'
    },
    {
      title: '💰 Comissões',
      value: 'R$ 0,00',
      icon: DollarSign,
      color: 'green',
      bgClass: 'from-green-500/20 to-green-600/10 border-green-500/30'
    },
    {
      title: '📊 Performance',
      value: 'Elite',
      icon: TrendingUp,
      color: 'blue',
      bgClass: 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
    },
    {
      title: '🎯 Meta',
      value: '0%',
      icon: Target,
      color: 'purple',
      bgClass: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
    }
  ];

  return (
    <PageLayout
      fullWidth={true}
      headerContent={
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title={`Olá, ${getDisplayName()}! 👋`}
            description="Bem-vindo ao seu portal elite de afiliados"
            icon="🏆"
          />
      </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Status Cards Grid - Mais compacto no mobile */}
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

      {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Content Area */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-orange-500/15 to-orange-600/10 border-orange-500/30 backdrop-blur-sm shadow-lg shadow-orange-500/10">
              <CardHeader className="pb-3 lg:pb-4">
                <CardTitle className="text-lg lg:text-xl font-bold text-white flex items-center gap-2 lg:gap-3">
                  <span className="text-base lg:text-lg">🏆</span>
                  Portal Afiliados da Elite
              </CardTitle>
                <CardDescription className="text-orange-100 text-sm lg:text-base">
                  Seu centro de comando para maximizar seus ganhos como afiliado elite
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                  <Target className="h-4 w-4 lg:h-5 lg:w-5 text-orange-400" />
                  <span className="text-slate-200">Status do perfil: </span>
                <Badge className={
                  profile?.affiliate_status === 'approved' 
                      ? "bg-orange-500/80 text-white backdrop-blur-sm"
                    : profile?.affiliate_status === 'pending'
                      ? "bg-yellow-500/80 text-white backdrop-blur-sm"
                      : "bg-red-500/80 text-white backdrop-blur-sm"
                }>
                    {profile?.affiliate_status === 'approved' ? 'Elite Aprovado' : 
                   profile?.affiliate_status === 'pending' ? 'Pendente' : 'Inativo'}
                </Badge>
              </div>
              {profile?.affiliate_status !== 'approved' && (
                  <div className="p-3 lg:p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start gap-2 lg:gap-3">
                      <span className="text-lg lg:text-xl">⚠️</span>
                      <div>
                        <p className="text-xs lg:text-sm text-yellow-100 font-medium">
                          Complete seu perfil para ter acesso total aos recursos elite
                  </p>
                  <Button 
                    size="sm" 
                          className="mt-2 lg:mt-3 bg-yellow-600/80 hover:bg-yellow-700/80 text-slate-900 font-bold backdrop-blur-sm text-xs lg:text-sm"
                    onClick={() => navigate('/dashboard/profile')}
                  >
                          Completar Perfil Elite
                  </Button>
                      </div>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Section */}
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3 lg:pb-4">
              <div className="flex items-center justify-between">
                  <CardTitle className="text-lg lg:text-xl font-bold text-white flex items-center gap-1 lg:gap-2">
                    <span className="text-base lg:text-lg">🏆</span>
                    <span className="hidden sm:inline">Produtos Elite em Destaque</span>
                    <span className="sm:hidden">Produtos Elite</span>
                  </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/products')}
                    className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 backdrop-blur-sm flex items-center gap-1 lg:gap-2 text-xs lg:text-sm"
                >
                    <span className="hidden sm:inline">Ver todos</span>
                    <span className="sm:hidden">Ver</span>
                    <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
                <CardDescription className="text-slate-300 text-xs lg:text-sm">
                  Explore nossos produtos premium com as melhores comissões
                </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                  <div className="space-y-3 lg:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-slate-700/50 h-16 lg:h-20 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 lg:space-y-4">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <div 
                      key={product.id}
                        className="flex items-center justify-between p-3 lg:p-4 rounded-xl transition-all duration-300 border bg-slate-700/30 border-slate-600/50 hover:border-orange-500/30 backdrop-blur-sm"
                    >
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                            <span className="text-xs lg:text-sm">🏆</span>
                            <h3 className="font-bold text-white text-sm lg:text-base truncate">{product.name}</h3>
                          </div>
                          <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm">
                            <Badge variant="outline" className="border-orange-400/50 text-orange-300 bg-orange-500/10 text-xs">
                              💰 {product.commission_rate}%
                          </Badge>
                            <span className="text-green-300 font-semibold">
                            R$ {product.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => openCreateLinkModal(product)}
                          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white ml-3 px-2 lg:px-3 text-xs lg:text-sm"
                      >
                        <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                          <span className="hidden sm:inline">Criar Link</span>
                          <span className="sm:hidden">Link</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
          {/* Profile Status */}
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3 lg:pb-4">
                <CardTitle className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-sm lg:text-base">🏆</span>
                  Seu Perfil Elite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <span className="text-base lg:text-lg">🏆</span>
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
      </div>

      {/* Create Link Modal */}
      <CreateLinkModal
        isOpen={createLinkModal.isOpen}
        onClose={closeCreateLinkModal}
        product={createLinkModal.product}
      />
    </PageLayout>
  );
};

export default Dashboard; 