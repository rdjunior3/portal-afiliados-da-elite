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
  User
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Olá, {getDisplayName()}! 
          <span className="text-2xl">👋</span>
        </h1>
        <p className="text-slate-400">
          Bem-vindo ao seu portal de afiliados elite
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => navigate('/dashboard/products')}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Package className="mr-2 h-4 w-4" />
          Explorar Produtos
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/content')}
          className="border-slate-600 text-slate-200 hover:bg-slate-800"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Ver Aulas
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/chat')}
          className="border-slate-600 text-slate-200 hover:bg-slate-800"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat Suporte
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                Bem-vindo ao Portal Elite
              </CardTitle>
              <CardDescription>
                Seu centro de comando para maximizar seus ganhos como afiliado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Target className="h-4 w-4 text-orange-400" />
                <span>Status do perfil: </span>
                <Badge className={
                  profile?.affiliate_status === 'approved' 
                    ? 'bg-orange-500/20 text-orange-400' 
                    : profile?.affiliate_status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }>
                  {profile?.affiliate_status === 'approved' ? 'Aprovado' : 
                   profile?.affiliate_status === 'pending' ? 'Pendente' : 'Inativo'}
                </Badge>
              </div>
              {profile?.affiliate_status !== 'approved' && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    Complete seu perfil para ter acesso total aos recursos do portal.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => navigate('/dashboard/profile')}
                  >
                    Completar Perfil
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Section */}
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
                  {featuredProducts.slice(0, 4).map((product) => (
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
          {/* Profile Status */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-orange-400" />
                Seu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nome</span>
                <span className="text-white font-medium">{getDisplayName()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ID Afiliado</span>
                <span className="text-white font-medium">
                  {profile?.affiliate_id || 'Pendente'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <Badge className={
                  profile?.affiliate_status === 'approved' 
                    ? 'bg-orange-500/20 text-orange-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }>
                  {profile?.affiliate_status === 'approved' ? 'Elite' : 'Pendente'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/products')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                <Package className="h-4 w-4 mr-3" />
                Explorar Produtos
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/content')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                <BookOpen className="h-4 w-4 mr-3" />
                Acessar Aulas
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/profile')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                <Settings className="h-4 w-4 mr-3" />
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                Dicas Elite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Complete seu perfil para desbloquear recursos premium</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Explore nossos produtos mais lucrativos</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Participe das aulas de capacitação</span>
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