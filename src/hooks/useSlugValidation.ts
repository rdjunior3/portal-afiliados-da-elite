import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseSlugValidationProps {
  currentProductId?: string; // Para edições, excluir o próprio produto
}

export const useSlugValidation = ({ currentProductId }: UseSlugValidationProps = {}) => {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateSlugUnique = async (slug: string): Promise<boolean> => {
    if (!slug || slug.length < 3) {
      return false;
    }

    try {
      setIsValidating(true);

      // Buscar produtos com o mesmo slug
      let query = supabase
        .from('products')
        .select('id, name')
        .eq('slug', slug);

      // Se estiver editando, excluir o produto atual
      if (currentProductId) {
        query = query.neq('id', currentProductId);
      }

      const { data: existingProducts, error } = await query;

      if (error) {
        console.error('Erro ao validar slug:', error);
        toast({
          title: "Erro na validação",
          description: "Não foi possível verificar se o slug está disponível",
          variant: "destructive",
        });
        return false;
      }

      if (existingProducts && existingProducts.length > 0) {
        const conflictProduct = existingProducts[0];
        toast({
          title: "Slug já existe",
          description: `O slug "${slug}" já está sendo usado pelo produto "${conflictProduct.name}"`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado na validação de slug:', error);
      toast({
        title: "Erro na validação",
        description: "Erro inesperado ao validar slug",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const generateSlugFromName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD') // Remover acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiais
      .replace(/\s+/g, '-') // Substituir espaços por hífens
      .replace(/-+/g, '-') // Remover hífens duplos
      .replace(/^-|-$/g, '') // Remover hífens no início/fim
      .substring(0, 50); // Limitar tamanho
  };

  return {
    validateSlugUnique,
    generateSlugFromName,
    isValidating
  };
}; 