import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { AffiliateLink } from '@/types';

export function useAffiliateLinks(productId: string | undefined) {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLinks = useCallback(async () => {
    if (!productId || !user) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      setLinks(data as AffiliateLink[]);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching affiliate links:", err);
    } finally {
      setLoading(false);
    }
  }, [productId, user]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const refetch = () => {
    fetchLinks();
  };

  return { links, loading, error, refetch };
} 
