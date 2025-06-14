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

  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🗑️ [ProductService] Iniciando exclusão do produto:', id);
      
      // Primeiro, verificar se o produto existe
      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('id, name, status')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ [ProductService] Produto não encontrado:', fetchError);
        throw new Error('Produto não encontrado');
      }

      console.log('🔍 [ProductService] Produto atual:', existingProduct);

      // Arquivar produto ao invés de deletar permanentemente
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'archived' as const,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ [ProductService] Erro ao arquivar produto:', {
          error,
          productId: id,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [ProductService] Produto arquivado com sucesso');
      return this.handleSuccess({ message: 'Produto arquivado com sucesso' });
    } catch (error) {
      console.error('💥 [ProductService] Erro na exclusão:', error);
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