import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface EliteTip {
  id: string;
  title: string;
  content: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const useEliteTips = () => {
  const [tips, setTips] = useState<EliteTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // Buscar dicas ativas
  const fetchTips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('elite_tips')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar dicas:', error);
        // Usar dicas padrão em caso de erro
        setTips(getDefaultTips());
        return;
      }

      if (data && data.length > 0) {
        setTips(data);
      } else {
        // Se não há dicas no banco, usar padrão
        setTips(getDefaultTips());
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar dicas:', error);
      setTips(getDefaultTips());
    } finally {
      setLoading(false);
    }
  };

  // Dicas padrão caso não consiga acessar o banco
  const getDefaultTips = (): EliteTip[] => [
    {
      id: 'default-1',
      title: 'Complete seu perfil',
      content: 'Complete seu perfil para desbloquear recursos premium exclusivos',
      icon: '🏆',
      order_index: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-2',
      title: 'Explore produtos premium',
      content: 'Explore nossos produtos com as maiores comissões do mercado',
      icon: '💰',
      order_index: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'default-3',
      title: 'Participe das capacitações',
      content: 'Participe das aulas de capacitação para aumentar suas vendas',
      icon: '📚',
      order_index: 3,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Atualizar dica (apenas para admins)
  const updateTip = async (tipId: string, updates: Partial<EliteTip>) => {
    if (!isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem editar dicas.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('elite_tips')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', tipId);

      if (error) {
        console.error('Erro ao atualizar dica:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
        return false;
      }

      // Atualizar estado local
      setTips(currentTips => 
        currentTips.map(tip => 
          tip.id === tipId ? { ...tip, ...updates } : tip
        )
      );

      toast({
        title: "Dica atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar dica:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Criar nova dica (apenas para admins)
  const createTip = async (tipData: Omit<EliteTip, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem criar dicas.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('elite_tips')
        .insert([{
          ...tipData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar dica:', error);
        toast({
          title: "Erro ao criar",
          description: "Não foi possível criar a nova dica.",
          variant: "destructive",
        });
        return false;
      }

      if (data) {
        setTips(currentTips => [...currentTips, data].sort((a, b) => a.order_index - b.order_index));
        toast({
          title: "Dica criada",
          description: "Nova dica foi criada com sucesso.",
        });
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar dica:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar a dica.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Deletar dica (apenas para admins)
  const deleteTip = async (tipId: string) => {
    if (!isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem deletar dicas.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('elite_tips')
        .update({ is_active: false })
        .eq('id', tipId);

      if (error) {
        console.error('Erro ao deletar dica:', error);
        toast({
          title: "Erro ao deletar",
          description: "Não foi possível deletar a dica.",
          variant: "destructive",
        });
        return false;
      }

      // Remover do estado local
      setTips(currentTips => currentTips.filter(tip => tip.id !== tipId));

      toast({
        title: "Dica removida",
        description: "A dica foi removida com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar dica:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao deletar a dica.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  return {
    tips,
    loading,
    isUpdating,
    updateTip,
    createTip,
    deleteTip,
    refetch: fetchTips
  };
}; 