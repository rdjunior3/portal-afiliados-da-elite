import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useEliteTips } from '@/hooks/useEliteTips';
import { LoadingScreen } from '@/components/ui/loading';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TrophyIcon from '@/components/ui/TrophyIcon';
import { 
  Sparkles,
  DollarSign,
  TrendingUp,
  Target,
  ArrowRight
} from 'lucide-react';
import CreateLinkModal from '@/components/CreateLinkModal';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

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

  const statsCards = [
    {
      title: 'Comissões do Mês',
      value: 'R$ 2.487,50',
      change: '+15.2%',
      icon: DollarSign,
      color: 'green',
      bgClass: 'from-green-500/20 to-green-600/10 border-green-500/30'
    },
    {
      title: 'Cliques Únicos',
      value: '1.842',
      change: '+8.7%',
      icon: Target,
      color: 'blue',
      bgClass: 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
    },
    {
      title: 'Taxa Conversão',
      value: '80%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'orange',
      bgClass: 'from-orange-500/20 to-orange-600/10 border-orange-500/30'
    },
    {
      title: 'Status Elite',
      value: profile?.affiliate_status === 'approved' ? 'ATIVO' : 'PENDENTE',
      icon: Sparkles,
      color: 'purple',
      bgClass: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
    }
  ];

  const platformStats = {
    totalAffiliates: 237,
    averageConversion: 80,
    totalCommissions: 'R$ 45.892,30',
    topProducts: 8
  };

  return (
    <PageLayout
      fullWidth={true}
      headerContent={
        <PageHeader
          title={`Olá, ${getDisplayName()}! 👋`}
          description="Bem-vindo ao seu portal elite de afiliados"
          customIcon={<TrophyIcon className="w-6 h-6" color="#f97316" />}
        />
      }
    >
      <DashboardContent
        profile={profile}
        statsCards={statsCards}
        platformStats={platformStats}
        featuredProducts={featuredProducts}
        isLoadingProducts={isLoadingProducts}
        tips={tips}
        tipsLoading={tipsLoading}
        isAdmin={isAdmin}
        getDisplayName={getDisplayName}
        openCreateLinkModal={openCreateLinkModal}
        navigate={navigate}
      />

      <CreateLinkModal
        isOpen={createLinkModal.isOpen}
        onClose={closeCreateLinkModal}
        product={createLinkModal.product}
      />
    </PageLayout>
  );
};

export default Dashboard;