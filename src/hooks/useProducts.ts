import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services';
import { PaginationParams } from '@/types';
import { queryOptimization } from '@/utils/performance';

export const useProducts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: queryOptimization.staleTime.products,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
    staleTime: queryOptimization.staleTime.products,
    refetchOnWindowFocus: false,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: queryOptimization.staleTime.static,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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