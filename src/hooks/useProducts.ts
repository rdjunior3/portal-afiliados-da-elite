import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services';
import { PaginationParams } from '@/types';

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

export const useProductsByCategory = (categoryId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, params],
    queryFn: () => productService.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}; 