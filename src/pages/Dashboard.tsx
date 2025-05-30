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
  Home
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Navigation Header */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-400/40 transition-all duration-300 transform group-hover:scale-105">
                    <div className="relative">
                      <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM12 4.44L18.18 9H5.82L12 4.44ZM6.09 11H17.91L17.25 19H6.75L6.09 11Z"/>
                        <circle cx="12" cy="14" r="2" fill="#0f172a"/>
                      </svg>
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    AFILIADOS DA ELITE
                  </div>
                  <div className="text-xs text-slate-400 -mt-1">Portal Premium</div>
                </div>
              </button>

              {/* Navigation */}
              <div className="hidden md:flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </div>
            </div>
            
            {/* User Profile */}
            <UserProfile />
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  Olá, {getDisplayName()}! 
                  <span className="text-2xl">👋</span>
                </h1>
                <p className="text-slate-400">
                  Bem-vindo ao seu dashboard de afiliado elite
                </p>
              </div>

              {/* Status badge */}
              {profile?.affiliate_status && (
                <div className="hidden sm:block">
                  <Badge 
                    className={
                      profile.affiliate_status === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' 
                        : profile.affiliate_status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                        : 'bg-red-500/20 text-red-400 border-red-400/30'
                    }
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {profile.affiliate_status === 'approved' ? 'Afiliado Aprovado' : 
                     profile.affiliate_status === 'pending' ? 'Aguardando Aprovação' : 
                     'Status: ' + profile.affiliate_status}
                  </Badge>
                </div>
              )}
            </div>

            {/* Quick stats bar */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>Dashboard ativo</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{linkStats?.totalLinks || 0} links criados</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>R$ {(linkStats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em comissões</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card 
              className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
              onClick={() => {
                track('stats_card_clicked', { metric: 'clicks' });
                trackFlow('clicks_analysis', 'dashboard_stats');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Total de Cliques
                </CardTitle>
                <MousePointer className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {linkStats?.totalClicks || 0}
                </div>
                <p className="text-xs text-slate-400">
                  {linkStats?.totalUniqueClicks || 0} únicos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Conversões
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {linkStats?.totalConversions || 0}
                </div>
                <p className="text-xs text-slate-400">
                  {linkStats?.conversionRate || 0}% taxa de conversão
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Receita Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  R$ {(linkStats?.totalRevenue || 0).toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2 
                  })}
                </div>
                <p className="text-xs text-slate-400">
                  Este mês
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  Links Ativos
                </CardTitle>
                <Link className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {linkStats?.totalLinks || 0}
                </div>
                <p className="text-xs text-slate-400">
                  Links criados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="links">Meus Links</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Ações Rápidas</CardTitle>
                  <CardDescription>
                    Comece a promover produtos e ganhar comissões
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => {
                      track('quick_action_clicked', { action: 'create_link' });
                      setActiveTab('products');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Novo Link
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 text-slate-200"
                    onClick={() => {
                      track('quick_action_clicked', { action: 'view_reports' });
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Relatórios
                  </Button>
                </CardContent>
              </Card>

              {/* Featured Products */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Produtos em Destaque</CardTitle>
                  <CardDescription>
                    Os produtos com melhor performance para afiliados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-slate-700 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featuredProducts.slice(0, 6).map((product) => (
                        <div 
                          key={product.id}
                          className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-green-500/50 transition-colors"
                        >
                          {product.thumbnail_url && (
                            <img 
                              src={product.thumbnail_url} 
                              alt={product.name}
                              className="w-full h-24 object-cover rounded mb-3"
                            />
                          )}
                          <h3 className="font-semibold text-white mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-green-600">
                              {product.commission_rate}% comissão
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-slate-600 text-slate-200"
                              onClick={() => openCreateLinkModal(product as Product)}
                            >
                              Promover
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Meus Links de Afiliado</CardTitle>
                  <CardDescription>
                    Gerencie todos os seus links personalizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLinks ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-700 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : userLinks.length === 0 ? (
                    <div className="text-center py-8">
                      <Link className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <p className="text-slate-400 mb-4">
                        Você ainda não tem links criados
                      </p>
                      <Button 
                        onClick={() => setActiveTab('products')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Criar Primeiro Link
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userLinks.map((link) => (
                        <div 
                          key={link.id}
                          className="bg-slate-700/50 p-4 rounded-lg border border-slate-600"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">
                                {link.products?.name}
                              </h3>
                              <p className="text-sm text-slate-400 mb-2">
                                {link.full_url}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-300">
                                <span>{link.clicks_count} cliques</span>
                                <span>{link.conversions_count} conversões</span>
                                <span>R$ {link.revenue_generated.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600"
                                onClick={() => copyToClipboard(link.full_url)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600"
                                onClick={() => window.open(link.full_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Biblioteca de Produtos</CardTitle>
                  <CardDescription>
                    Encontre produtos para promover e criar seus links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category) => (
                      <Badge 
                        key={category.id} 
                        variant="outline"
                        className="border-slate-600 text-slate-200"
                        style={{ borderColor: category.color }}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Products Grid */}
                  {isLoadingProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-slate-700 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredProducts.map((product) => (
                        <div 
                          key={product.id}
                          className="bg-slate-700/50 rounded-lg border border-slate-600 hover:border-green-500/50 transition-colors overflow-hidden"
                        >
                          {product.thumbnail_url && (
                            <img 
                              src={product.thumbnail_url} 
                              alt={product.name}
                              className="w-full h-32 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-white mb-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                              {product.short_description}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-green-600">
                                {product.commission_rate}% comissão
                              </Badge>
                              {product.price && (
                                <span className="text-sm text-slate-300">
                                  R$ {product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => openCreateLinkModal(product as Product)}
                            >
                              Criar Link de Afiliado
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modal de Criação de Link */}
          <CreateLinkModal
            isOpen={createLinkModal.isOpen}
            onClose={closeCreateLinkModal}
            product={createLinkModal.product}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 