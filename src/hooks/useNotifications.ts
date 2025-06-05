import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'commission' | 'payment' | 'product' | 'system' | 'achievement';
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  priority: number;
  metadata?: any;
  expires_at?: string;
  read_at?: string;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Buscar notificações do usuário
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return;
      }

      setNotifications(data || []);
      
      // Contar não lidas
      const unread = data?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Erro inesperado ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      // Atualizar estado local
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      ));

      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('Erro inesperado ao marcar notificação:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível marcar todas as notificações como lidas.',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString()
      })));

      setUnreadCount(0);

      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas.',
      });

    } catch (error) {
      console.error('Erro inesperado ao marcar todas como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao marcar notificações.',
        variant: 'destructive',
      });
    }
  };

  // Subscription para notificações em tempo real
  useEffect(() => {
    if (!user?.id) return;

    // Buscar notificações iniciais
    fetchNotifications();

    // Configurar subscription para notificações em tempo real
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Adicionar nova notificação
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Mostrar toast para nova notificação
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          
          // Atualizar notificação existente
          setNotifications(prev => prev.map(n => 
            n.id === updatedNotification.id ? updatedNotification : n
          ));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};