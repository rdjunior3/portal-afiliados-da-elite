import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { affiliateService } from '@/services';
import { AffiliateProfile, AffiliateStats, PaginationParams } from '@/types';
import { useToast } from './use-toast';

export const useAffiliateProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['affiliate', 'profile', userId],
    queryFn: () => affiliateService.getProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAffiliateStats = () => {
  return useQuery({
    queryKey: ['affiliate', 'stats'],
    queryFn: () => affiliateService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAffiliateLinks = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['affiliate', 'links', params],
    queryFn: () => affiliateService.getLinks(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (updates: Partial<AffiliateProfile>) => 
      affiliateService.updateProfile(updates),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['affiliate', 'profile'] });
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Erro ao atualizar perfil.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar perfil.",
        variant: "destructive",
      });
    },
  });
};

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, customParams }: { 
      productId: string; 
      customParams?: Record<string, any> 
    }) => affiliateService.createLink(productId, customParams),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['affiliate', 'links'] });
        queryClient.invalidateQueries({ queryKey: ['affiliate', 'stats'] });
        toast({
          title: "Link criado",
          description: "Seu link de afiliado foi criado com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: response.error || "Erro ao criar link.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar link.",
        variant: "destructive",
      });
    },
  });
}; 