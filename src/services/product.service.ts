import { supabase } from '@/integrations/supabase/client';
import { ApiService } from './api.service';
import { Product, Category, ProductApproval, ApiResponse, PaginationParams } from '@/types';

export class ProductService extends ApiService {
  async getProducts(params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true);

      return await this.executePaginatedQuery(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.handleSuccess(data);
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

  async requestProductApproval(productId: string): Promise<ApiResponse<ProductApproval>> {
    try {
      const user = await this.requireAuth();

      const { data, error } = await supabase
        .from('product_approvals')
        .insert({
          product_id: productId,
          affiliate_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getApprovedProducts(params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const user = await this.requireAuth();

      const query = supabase
        .from('product_approvals')
        .select(`
          *,
          products (
            id,
            name,
            description,
            price,
            commission_rate,
            image_url,
            sales_page_url,
            categories (
              id,
              name,
              slug
            )
          )
        `)
        .eq('affiliate_id', user.id)
        .eq('status', 'approved');

      return await this.executePaginatedQuery(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProductsByCategory(categoryId: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true);

      return await this.executePaginatedQuery(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const productService = new ProductService(); 