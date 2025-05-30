import { supabase } from '@/integrations/supabase/client';
import { ApiService } from './api.service';
import { Commission, Payment, LinkAnalytics, ApiResponse, PaginationParams } from '@/types';

export class CommissionService extends ApiService {
  async getCommissions(params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const user = await this.requireAuth();

      const query = supabase
        .from('commissions')
        .select(`
          *,
          products (
            id,
            name,
            price
          ),
          affiliate_links (
            id,
            short_code
          )
        `)
        .eq('affiliate_id', user.id);

      return await this.executePaginatedQuery(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCommissionById(id: string): Promise<ApiResponse<Commission>> {
    try {
      const user = await this.requireAuth();

      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          products (
            id,
            name,
            price
          ),
          affiliate_links (
            id,
            short_code
          )
        `)
        .eq('id', id)
        .eq('affiliate_id', user.id)
        .single();

      if (error) throw error;

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPayments(params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const user = await this.requireAuth();

      const query = supabase
        .from('payments')
        .select('*')
        .eq('affiliate_id', user.id);

      return await this.executePaginatedQuery(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async requestPayment(amount: number, method: string, paymentDetails: Record<string, any>): Promise<ApiResponse<Payment>> {
    try {
      const user = await this.requireAuth();

      const { data, error } = await supabase
        .from('payments')
        .insert({
          affiliate_id: user.id,
          amount,
          method,
          payment_details: paymentDetails,
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

  async getAnalytics(linkId?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    try {
      const user = await this.requireAuth();

      let query = supabase
        .from('link_analytics')
        .select(`
          *,
          affiliate_links!inner (
            id,
            short_code,
            affiliate_id
          )
        `)
        .eq('affiliate_links.affiliate_id', user.id);

      if (linkId) {
        query = query.eq('link_id', linkId);
      }

      return await this.executePaginatedQuery(query, params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getEarningsSummary(): Promise<ApiResponse<any>> {
    try {
      const user = await this.requireAuth();

      const { data, error } = await supabase
        .rpc('get_earnings_summary', { affiliate_uuid: user.id });

      if (error) throw error;

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTopPerformingLinks(limit: number = 10): Promise<ApiResponse<any>> {
    try {
      const user = await this.requireAuth();

      const { data, error } = await supabase
        .rpc('get_top_performing_links', { 
          affiliate_uuid: user.id,
          link_limit: limit 
        });

      if (error) throw error;

      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const commissionService = new CommissionService(); 