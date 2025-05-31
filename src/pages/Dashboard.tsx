import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { useAnalytics } from '@/hooks/useAnalytics';
import { UserProfile } from '@/components/auth/UserProfile';
import { LoadingScreen } from '@/components/ui/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  MousePointer, 
  TrendingUp, 
  Users, 
  Link, 
  Plus,
  ExternalLink,
  Eye,
  Copy,
  Sparkles,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateLinkModal from '@/components/CreateLinkModal';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import React from 'react';

type Product = Tables<'products'> & {
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { featuredProducts, categories, isLoadingProducts } = useProducts();
  const { userLinks, linkStats, isLoadingLinks } = useAffiliateLinks();
  const { track, trackConversion, trackFlow } = useAnalytics();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [createLinkModal, setCreateLinkModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null
  });

  const openCreateLinkModal = (product: Product) => {
    track('create_link_modal_opened', {
      productId: product.id,
      productName: product.name,
      commissionRate: product.commission_rate
    });

    setCreateLinkModal({
      isOpen: true,
      product
    });
  };

  const closeCreateLinkModal = () => {
    track('create_link_modal_closed');
    setCreateLinkModal({
      isOpen: false,
      product: null
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    track('affiliate_link_copied', {
      linkLength: text.length
    });
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência.",
    });
  };

  const handleTabChange = (tab: string) => {
    track('dashboard_tab_changed', {
      fromTab: activeTab,
      toTab: tab
    });
    setActiveTab(tab);
  };

  // Track dashboard visit
  React.useEffect(() => {
    track('dashboard_visited', {
      affiliateStatus: profile?.affiliate_status,
      totalLinks: linkStats?.totalLinks || 0,
      totalRevenue: linkStats?.totalRevenue || 0
    });
  }, []);

  if (loading) {
    return <LoadingScreen message="Carregando seu dashboard..." />;
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

  // Mock data para demonstração
  const monthlyStats = {
    currentMonth: {
      revenue: 1250.00,
      clicks: 1580,
      conversions: 45,
      links: 12
    },
    lastMonth: {
      revenue: 980.00,
      clicks: 1320,
      conversions: 38,
      links: 10
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous * 100);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  Olá, {getDisplayName()}! 
                  <span className="text-2xl">👋</span>
                </h1>
                <p className="text-slate-400">
          Acompanhe seu desempenho e ganhe mais comissões como afiliado elite
                </p>
              </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => navigate('/dashboard/products')}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo Link
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/analytics')}
          className="border-slate-600 text-slate-200 hover:bg-slate-800"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Analytics
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/payments')}
          className="border-slate-600 text-slate-200 hover:bg-slate-800"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Solicitar Pagamento
        </Button>
                </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              Receita Total
            </CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {monthlyStats.currentMonth.revenue.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })}
              </div>
            <div className="flex items-center gap-1 text-xs">
              {calculateGrowth(monthlyStats.currentMonth.revenue, monthlyStats.lastMonth.revenue) > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-orange-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-400" />
              )}
              <span className={`font-medium ${
                calculateGrowth(monthlyStats.currentMonth.revenue, monthlyStats.lastMonth.revenue) > 0 
                  ? 'text-orange-400' 
                  : 'text-red-400'
              }`}>
                {Math.abs(calculateGrowth(monthlyStats.currentMonth.revenue, monthlyStats.lastMonth.revenue)).toFixed(1)}%
              </span>
              <span className="text-slate-400">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Clicks Card */}
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Total de Cliques
                </CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MousePointer className="h-4 w-4 text-blue-400" />
            </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
              {monthlyStats.currentMonth.clicks.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-orange-400" />
              <span className="text-orange-400 font-medium">
                {calculateGrowth(monthlyStats.currentMonth.clicks, monthlyStats.lastMonth.clicks).toFixed(1)}%
              </span>
              <span className="text-slate-400">vs mês anterior</span>
                </div>
              </CardContent>
            </Card>

        {/* Conversions Card */}
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Conversões
                </CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
              {monthlyStats.currentMonth.conversions}
                </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400">Taxa de conversão:</span>
              <span className="text-purple-400 font-medium">
                {((monthlyStats.currentMonth.conversions / monthlyStats.currentMonth.clicks) * 100).toFixed(1)}%
              </span>
                </div>
              </CardContent>
            </Card>

        {/* Links Card */}
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Links Ativos
                </CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Link className="h-4 w-4 text-orange-400" />
            </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
              {monthlyStats.currentMonth.links}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Plus className="h-3 w-3 text-orange-400" />
              <span className="text-orange-400 font-medium">
                +{monthlyStats.currentMonth.links - monthlyStats.lastMonth.links}
              </span>
              <span className="text-slate-400">este mês</span>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Progress */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Meta Mensal</CardTitle>
                  <CardDescription>
                    Progresso para atingir sua meta de R$ 2.000,00
                  </CardDescription>
                </div>
                <Badge className="bg-orange-500/20 text-orange-400">
                  62% completa
                </Badge>
              </div>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">R$ {monthlyStats.currentMonth.revenue.toFixed(2)}</span>
                <span className="text-slate-400">R$ 2.000,00</span>
              </div>
              <Progress 
                value={(monthlyStats.currentMonth.revenue / 2000) * 100} 
                className="h-3"
              />
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Target className="h-4 w-4" />
                <span>Faltam R$ {(2000 - monthlyStats.currentMonth.revenue).toFixed(2)} para atingir a meta</span>
              </div>
                </CardContent>
              </Card>

          {/* Top Products */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
              <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Produtos em Destaque</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/products')}
                  className="text-orange-400 hover:text-orange-300"
                >
                  Ver todos
                </Button>
              </div>
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-slate-700/50 h-16 rounded-lg"></div>
                    </div>
                  ))}
                    </div>
                  ) : (
                <div className="space-y-4">
                  {featuredProducts.slice(0, 3).map((product) => (
                        <div 
                          key={product.id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                              {product.commission_rate}% comissão
                            </Badge>
                          <span className="text-slate-400">
                            R$ {product.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                            <Button 
                              size="sm" 
                        onClick={() => openCreateLinkModal(product)}
                        className="bg-orange-600 hover:bg-orange-700"
                            >
                        <Plus className="h-4 w-4 mr-1" />
                        Link
                            </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Estatísticas Rápidas
              </CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hoje</span>
                <span className="text-white font-medium">R$ 45,00</span>
                    </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Esta semana</span>
                <span className="text-white font-medium">R$ 312,50</span>
                    </div>
                          <div className="flex items-center justify-between">
                <span className="text-slate-400">Ranking</span>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium">#12</span>
                              </div>
                            </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-slate-300">Nova conversão - R$ 25,00</span>
                            </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-300">15 novos cliques</span>
                          </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-slate-300">Link criado: Produto X</span>
                        </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-slate-300">Pagamento processado</span>
                    </div>
                </CardContent>
              </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                Próximos Passos
              </CardTitle>
                </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/profile')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                Completar perfil
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/products')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                Criar mais links
              </Button>
                            <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/analytics')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                Analisar performance
                            </Button>
            </CardContent>
          </Card>
                          </div>
                        </div>

      {/* Create Link Modal */}
          <CreateLinkModal
            isOpen={createLinkModal.isOpen}
            onClose={closeCreateLinkModal}
            product={createLinkModal.product}
          />
    </div>
  );
};

export default Dashboard; 