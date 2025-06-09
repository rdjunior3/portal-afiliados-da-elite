import { supabase } from '@/integrations/supabase/client';
import { ApiService } from './api.service';
import { Database } from '@/types/supabase';
import { ApiResponse, PaginationParams, PaginatedResponse } from '@/types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type ProductWithOffers = Product & {
  product_offers: Database['public']['Tables']['product_offers']['Row'][];
};

export class ProductService extends ApiService {
  async getProducts(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ProductWithOffers>>> {
    try {
      const query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          product_offers (
            *
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      return await this.executePaginatedQuery<ProductWithOffers>(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProduct(id: string): Promise<ApiResponse<ProductWithOffers>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          product_offers (
            *
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.handleSuccess(data as ProductWithOffers);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProductsByCategory(categoryId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ProductWithOffers>>> {
    try {
      const query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          product_offers (
            *
          )
        `, { count: 'exact' })
        .eq('category_id', categoryId)
        .eq('is_active', true);

      return await this.executePaginatedQuery<ProductWithOffers>(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const productService = new ProductService(); 