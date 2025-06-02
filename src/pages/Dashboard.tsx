import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { UserProfile } from '@/components/auth/UserProfile';
import { LoadingScreen } from '@/components/ui/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Plus,
  Eye,
  Sparkles,
  Home,
  Target,
  Award,
  Zap,
  BookOpen,
  MessageSquare,
  Settings,
  User,
  TrendingUp,
  DollarSign
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

  return (
    <div className="space-y-8">
      {/* Welcome Section melhorada */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🏆</span>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
              Olá, {getDisplayName()}!
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-orange-400 font-semibold">
              Bem-vindo ao seu portal elite de afiliados
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards Row - Nova seção */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Status Elite</p>
                <p className="text-2xl font-bold text-white">
                  {profile?.affiliate_status === 'approved' ? 'ATIVO' : 'PENDENTE'}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">💰 Comissões</p>
                <p className="text-2xl font-bold text-white">R$ 0,00</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">📊 Performance</p>
                <p className="text-2xl font-bold text-white">Elite</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">🎯 Meta</p>
                <p className="text-2xl font-bold text-white">0%</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions melhoradas */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => navigate('/dashboard/products')}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105"
        >
          <Package className="mr-2 h-4 w-4" />
          Explorar Produtos Elite
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/content')}
          className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400/60 transition-all duration-300"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          📚 Ver Aulas Premium
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/chat')}
          className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/60 transition-all duration-300"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          💬 Chat Elite
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Card melhorada */}
          <Card className="bg-gradient-to-br from-orange-500/15 to-orange-600/10 border-orange-500/30 shadow-lg shadow-orange-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-lg">🏆</span>
                Portal Afiliados Elite
              </CardTitle>
              <CardDescription className="text-orange-200">
                Seu centro de comando para maximizar seus ganhos como afiliado elite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-5 w-5 text-orange-400" />
                <span className="text-slate-300">Status do perfil: </span>
                <Badge className={
                  profile?.affiliate_status === 'approved' 
                    ? 'bg-orange-500/30 text-orange-300 border-orange-400/50' 
                    : profile?.affiliate_status === 'pending'
                    ? 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50'
                    : 'bg-red-500/30 text-red-300 border-red-400/50'
                }>
                  {profile?.affiliate_status === 'approved' ? 'Elite Aprovado' : 
                   profile?.affiliate_status === 'pending' ? 'Pendente' : 'Inativo'}
                </Badge>
              </div>
              {profile?.affiliate_status !== 'approved' && (
                <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-sm text-yellow-200 font-medium">
                        Complete seu perfil para ter acesso total aos recursos elite
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-bold"
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

          {/* Products Section melhorada */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  Produtos Elite em Destaque
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard/products')}
                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                >
                  Ver todos os produtos
                </Button>
              </div>
              <CardDescription>
                Explore nossos produtos premium com as melhores comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-slate-700/50 h-20 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/40 to-slate-800/30 rounded-xl hover:from-slate-700/60 hover:to-slate-800/50 transition-all duration-300 border border-slate-600/30 hover:border-orange-500/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">🏆</span>
                          <h3 className="font-bold text-white">{product.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className="border-orange-500/60 text-orange-400 bg-orange-500/10">
                            💰 {product.commission_rate}% comissão
                          </Badge>
                          <span className="text-green-400 font-semibold">
                            R$ {product.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => openCreateLinkModal(product)}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Criar Link
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar melhorada */}
        <div className="space-y-8">
          {/* Profile Status melhorado */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-base">🏆</span>
                Seu Perfil Elite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-lg">🏆</span>
                </div>
                <h3 className="text-white font-bold text-lg">{getDisplayName()}</h3>
                <p className="text-orange-400 font-medium">Afiliado Elite</p>
              </div>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                  <span className="text-slate-400">ID Afiliado</span>
                  <span className="text-orange-300 font-bold">
                    {profile?.affiliate_id || 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                  <span className="text-slate-400">Status</span>
                  <Badge className={
                    profile?.affiliate_status === 'approved' 
                      ? 'bg-orange-500/30 text-orange-300 border-orange-400/50' 
                      : 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50'
                  }>
                    {profile?.affiliate_status === 'approved' ? 'Elite' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions melhoradas */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-400" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/products')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent transition-all duration-300"
              >
                <Package className="h-4 w-4 mr-3" />
                Explorar Produtos Elite
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/content')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all duration-300"
              >
                <BookOpen className="h-4 w-4 mr-3" />
                📚 Acessar Aulas Premium
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/profile')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent transition-all duration-300"
              >
                <Settings className="h-4 w-4 mr-3" />
                ⚙️ Configurar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card melhorada */}
          <Card className="bg-gradient-to-br from-orange-500/15 to-orange-600/10 border-orange-500/30 shadow-lg shadow-orange-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-base">💡</span>
                Dicas Elite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <span className="text-base">🏆</span>
                <span className="text-slate-300 leading-relaxed">
                  Complete seu perfil para desbloquear recursos premium exclusivos
                </span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <span className="text-base">💰</span>
                <span className="text-slate-300 leading-relaxed">
                  Explore nossos produtos com as maiores comissões do mercado
                </span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <span className="text-base">📚</span>
                <span className="text-slate-300 leading-relaxed">
                  Participe das aulas de capacitação para aumentar suas vendas
                </span>
              </div>
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