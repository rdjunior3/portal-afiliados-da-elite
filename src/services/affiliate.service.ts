import { supabase } from '@/integrations/supabase/client';
import { ApiService } from './api.service';
import { AffiliateProfile, AffiliateLink, AffiliateStats, ApiResponse, PaginationParams } from '@/types';

export class AffiliateService extends ApiService {
  async getProfile(userId?: string): Promise<ApiResponse<AffiliateProfile>> {
    try {
      const user = userId || await this.requireAuth();
      const userIdToUse = typeof user === 'string' ? user : user.id;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userIdToUse)
        .single();

      if (error) throw error;

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(updates: Partial<AffiliateProfile>): Promise<ApiResponse<AffiliateProfile>> {
    try {
      const user = await this.requireAuth();

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getLinks(params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const user = await this.requireAuth();

      const query = supabase
        .from('affiliate_links')
        .select(`
          *,
          products (
            id,
            name,
            price,
            commission_rate
          )
        `)
        .eq('affiliate_id', user.id);

      return await this.executePaginatedQuery(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createLink(productId: string, customParams?: Record<string, any>): Promise<ApiResponse<AffiliateLink>> {
    try {
      const user = await this.requireAuth();

      // First get product info
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('sales_page_url')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const { data, error } = await supabase
        .from('affiliate_links')
        .insert({
          affiliate_id: user.id,
          product_id: productId,
          original_url: product.sales_page_url,
          custom_params: customParams,
        })
        .select()
        .single();

      if (error) throw error;

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getStats(): Promise<ApiResponse<AffiliateStats>> {
    try {
      const user = await this.requireAuth();

      const { data, error } = await supabase
        .rpc('get_affiliate_stats', { affiliate_uuid: user.id });

      if (error) throw error;

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async trackClick(linkId: string, analyticsData?: Partial<any>): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('link_analytics')
        .insert({
          link_id: linkId,
          ...analyticsData,
        });

      if (error) throw error;

      return this.handleSuccess(undefined);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const affiliateService = new AffiliateService(); 