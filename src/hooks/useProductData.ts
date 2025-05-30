import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services';
import { PaginationParams } from '@/types';
import { useToast } from './use-toast';

export const useProducts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useApprovedProducts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', 'approved', params],
    queryFn: () => productService.getApprovedProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductsByCategory = (categoryId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, params],
    queryFn: () => productService.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRequestProductApproval = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string) => 
      productService.requestProductApproval(productId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['products', 'approved'] });
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de aprovação foi enviada com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Erro ao solicitar aprovação.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro inesperado ao solicitar aprovação.",
        variant: "destructive",
      });
    },
  });
}; 