import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useEliteTips } from '@/hooks/useEliteTips';
import { LoadingScreen } from '@/components/ui/loading';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import TrophyIcon from '@/components/ui/TrophyIcon';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  const { user, profile, loading, isAdmin } = useAuth();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { tips, loading: tipsLoading } = useEliteTips();
  const navigate = useNavigate();

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

  const featuredProducts = productsData?.data?.data || [];

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
        featuredProducts={featuredProducts}
        isLoadingProducts={isLoadingProducts}
        tips={tips}
        tipsLoading={tipsLoading}
        isAdmin={isAdmin}
        navigate={navigate}
      />
    </PageLayout>
  );
};

export default Dashboard;