import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useInitialSetup = () => {
  const { user, isAdmin } = useAuth();

  // Verificar e criar sala "Comunidade da Elite" se necessário
  const { data: eliteRoomExists } = useQuery({
    queryKey: ['elite-room-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('name', 'Comunidade da Elite')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!user && isAdmin()
  });

  // Criar sala "Comunidade da Elite" se não existir
  useEffect(() => {
    const createEliteRoom = async () => {
      if (!user || !isAdmin() || eliteRoomExists) return;

      try {
        const { error } = await supabase
          .from('chat_rooms')
          .insert([{
            name: 'Comunidade da Elite',
            description: 'Sala oficial da comunidade de afiliados elite. Networking premium e discussões estratégicas.',
            is_active: true
          }]);

        if (error) {
          console.error('Erro ao criar sala Comunidade da Elite:', error);
        }
      } catch (error) {
        console.error('Erro inesperado ao criar sala:', error);
      }
    };

    createEliteRoom();
  }, [user, isAdmin, eliteRoomExists]);

  return {
    isSetupComplete: eliteRoomExists !== undefined
  };
}; 