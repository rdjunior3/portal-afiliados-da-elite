import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services';
import { PaginationParams } from '@/types';
import { queryOptimization } from '@/utils/performance';
import { useToast } from '@/hooks/use-toast';

export const useProducts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: queryOptimization.staleTime.products,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: queryOptimization.staleTime.products,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
    staleTime: queryOptimization.staleTime.products,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useProductsByCategory = (categoryId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, params],
    queryFn: () => productService.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: queryOptimization.staleTime.products,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    onSuccess: (response) => {
      // Invalidar cache dos produtos para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "Produto arquivado",
        description: "O produto foi arquivado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao deletar produto:', error);
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar o produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productService.updateProduct(id, data),
    onSuccess: (response) => {
      // Invalidar cache dos produtos para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}; 