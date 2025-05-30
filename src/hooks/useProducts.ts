import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

export const useProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar produtos ativos
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Buscar categorias
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data;
    }
  });

  // Buscar produtos em destaque
  const {
    data: featuredProducts = [],
    isLoading: isLoadingFeatured
  } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('gravity_score', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    }
  });

  // Buscar produtos por categoria
  const getProductsByCategory = (categoryId: string) => {
    return useQuery({
      queryKey: ['products', 'category', categoryId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              color
            )
          `)
          .eq('status', 'active')
          .eq('category_id', categoryId)
          .order('commission_rate', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!categoryId
    });
  };

  // Buscar detalhes de um produto
  const getProductDetails = (productId: string) => {
    return useQuery({
      queryKey: ['products', productId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              slug,
              color
            )
          `)
          .eq('id', productId)
          .single();

        if (error) throw error;
        return data;
      },
      enabled: !!productId
    });
  };

  // Solicitar aprovação para promover produto
  const requestProductApproval = useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase
        .from('product_approvals')
        .insert({
          product_id: productId,
          user_id: (await supabase.auth.getUser()).data.user?.id!
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação para promover este produto foi enviada para análise.",
      });
      queryClient.invalidateQueries({ queryKey: ['product-approvals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na solicitação",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Buscar status de aprovações do usuário
  const {
    data: userApprovals = [],
    isLoading: isLoadingApprovals
  } = useQuery({
    queryKey: ['product-approvals'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('product_approvals')
        .select(`
          *,
          products (
            id,
            name,
            thumbnail_url
          )
        `)
        .eq('user_id', user.data.user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return {
    products,
    categories,
    featuredProducts,
    userApprovals,
    isLoadingProducts,
    isLoadingCategories,
    isLoadingFeatured,
    isLoadingApprovals,
    productsError,
    getProductsByCategory,
    getProductDetails,
    requestProductApproval: requestProductApproval.mutate,
    isRequestingApproval: requestProductApproval.isPending
  };
}; 