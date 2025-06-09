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

  const featuredProducts = productsData?.data?.data || [];

  return (
    <PageLayout
      fullWidth={true}
      headerContent={
        <PageHeader
          title={`Olá! 👋`}
          description="Bem-vindo ao seu portal elite de afiliados"
          customIcon={<TrophyIcon className="w-6 h-6" color="#f97316" />}
        />
      }
    >
      <DashboardContent
        user={user}
        profile={profile}
        featuredProducts={featuredProducts}
        isLoadingProducts={isLoadingProducts}
        tips={tips}
        tipsLoading={tipsLoading}
        navigate={navigate}
      />
    </PageLayout>
  );
};

export default Dashboard;