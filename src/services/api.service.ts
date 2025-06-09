import { supabase } from '@/integrations/supabase/client';
import { ApiResponse, PaginationParams, PaginatedResponse } from '@/types';

export class ApiService {
  protected handleError(error: any): ApiResponse {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message || 'Erro interno do servidor'
    };
  }

  protected handleSuccess<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data
    };
  }

  protected buildPaginatedQuery(
    query: any,
    { page = 1, limit = 10, sortBy, sortOrder = 'desc' }: PaginationParams = {}
  ) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    return query.range(from, to);
  }

  protected async executePaginatedQuery<T>(
    query: any,
    params: PaginationParams = {}
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    try {
      const { page = 1, limit = 10 } = params;
      
      // Get total count
      const { count } = await query.select('*', { count: 'exact', head: true });
      
      // Get paginated data
      const paginatedQuery = this.buildPaginatedQuery(query, params);
      const { data, error } = await paginatedQuery;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return this.handleSuccess({
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Auth helpers
  protected async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  protected async requireAuth() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user;
  }
} 