import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type AffiliateLink = Tables<'affiliate_links'>;

interface CreateLinkParams {
  productId: string;
  customSlug: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export const useAffiliateLinks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar links do usuário
  const {
    data: userLinks = [],
    isLoading: isLoadingLinks,
    error: linksError
  } = useQuery({
    queryKey: ['affiliate-links'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('affiliate_links')
        .select(`
          *,
          products (
            id,
            name,
            thumbnail_url,
            commission_rate,
            categories (
              name,
              color
            )
          )
        `)
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Criar novo link de afiliado
  const createAffiliateLink = useMutation({
    mutationFn: async (params: CreateLinkParams) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuário não autenticado');

      // Verificar se o slug já existe
      const { data: existingLink } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('custom_slug', params.customSlug)
        .single();

      if (existingLink) {
        throw new Error('Este slug já está em uso. Escolha outro.');
      }

      // Buscar dados do produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('affiliate_link')
        .eq('id', params.productId)
        .single();

      if (productError) throw productError;

      const { data, error } = await supabase
        .from('affiliate_links')
        .insert({
          user_id: user.data.user.id,
          product_id: params.productId,
          custom_slug: params.customSlug,
          original_url: product.affiliate_link,
          utm_campaign: params.utmCampaign,
          utm_content: params.utmContent,
          utm_term: params.utmTerm
        })
        .select(`
          *,
          products (
            name,
            thumbnail_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Link criado com sucesso!",
        description: `Seu link personalizado foi criado: ${data.full_url}`,
      });
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar link",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Atualizar link existente
  const updateAffiliateLink = useMutation({
    mutationFn: async ({ linkId, updates }: { 
      linkId: string; 
      updates: Partial<AffiliateLink> 
    }) => {
      const { data, error } = await supabase
        .from('affiliate_links')
        .update(updates)
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Link atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Excluir link
  const deleteAffiliateLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Link excluído",
        description: "O link foi removido permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Buscar analytics de um link específico
  const getLinkAnalytics = (linkId: string, startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: ['link-analytics', linkId, startDate, endDate],
      queryFn: async () => {
        let query = supabase
          .from('link_analytics')
          .select('*')
          .eq('link_id', linkId)
          .order('created_at', { ascending: false });

        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      enabled: !!linkId
    });
  };

  // Registrar clique em link (função para ser chamada pelo redirect)
  const logClick = useMutation({
    mutationFn: async (params: {
      linkId: string;
      ipAddress?: string;
      userAgent?: string;
      refererUrl?: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase.rpc('log_link_click', {
        p_link_id: params.linkId,
        p_ip_address: params.ipAddress,
        p_user_agent: params.userAgent,
        p_referer_url: params.refererUrl,
        p_metadata: params.metadata
      });

      if (error) throw error;
      return data;
    }
  });

  // Buscar estatísticas resumidas dos links
  const {
    data: linkStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['affiliate-links', 'stats'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;

      const { data, error } = await supabase
        .from('affiliate_links')
        .select('clicks_count, unique_clicks_count, conversions_count, revenue_generated')
        .eq('user_id', user.data.user.id);

      if (error) throw error;

      const totals = data.reduce((acc, link) => ({
        totalClicks: acc.totalClicks + link.clicks_count,
        totalUniqueClicks: acc.totalUniqueClicks + link.unique_clicks_count,
        totalConversions: acc.totalConversions + link.conversions_count,
        totalRevenue: acc.totalRevenue + link.revenue_generated
      }), {
        totalClicks: 0,
        totalUniqueClicks: 0,
        totalConversions: 0,
        totalRevenue: 0
      });

      const conversionRate = totals.totalClicks > 0 
        ? (totals.totalConversions / totals.totalClicks) * 100 
        : 0;

      return {
        ...totals,
        conversionRate: Number(conversionRate.toFixed(2)),
        totalLinks: data.length
      };
    }
  });

  return {
    userLinks,
    linkStats,
    isLoadingLinks,
    isLoadingStats,
    linksError,
    createAffiliateLink: createAffiliateLink.mutate,
    updateAffiliateLink: updateAffiliateLink.mutate,
    deleteAffiliateLink: deleteAffiliateLink.mutate,
    logClick: logClick.mutate,
    getLinkAnalytics,
    isCreatingLink: createAffiliateLink.isPending,
    isUpdatingLink: updateAffiliateLink.isPending,
    isDeletingLink: deleteAffiliateLink.isPending
  };
}; 