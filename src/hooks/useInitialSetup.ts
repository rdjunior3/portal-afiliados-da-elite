import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInitialSetup = () => {
  const { user, isAdmin } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Se o usuário não for admin, o hook não faz nada.
  if (!isAdmin()) {
    return { isSetupComplete: true }; // Retorna como completo para não bloquear nada.
  }

  // A lógica abaixo só será executada para administradores.

  // Verificar e criar sala "Comunidade da Elite" se necessário
  const { data: eliteRoomExists, refetch } = useQuery({
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
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos - evita múltiplas consultas
    retry: false
  });

  // Criar sala "Comunidade da Elite" se não existir
  useEffect(() => {
    const createEliteRoom = async () => {
      // Verificações de segurança
      if (!user || eliteRoomExists || isCreating) return;

      setIsCreating(true);
      
      try {
        // Verificar novamente antes de criar (double-check)
        const { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('name', 'Comunidade da Elite')
          .single();

        if (existingRoom) {
          console.log('✅ Sala "Comunidade da Elite" já existe');
          refetch(); // Atualizar estado
          return;
        }

        console.log('🚀 Criando sala "Comunidade da Elite"...');
        const { error } = await supabase
          .from('chat_rooms')
          .insert([{
            name: 'Comunidade da Elite',
            description: 'Sala oficial da comunidade de afiliados elite. Networking premium e discussões estratégicas.',
            is_active: true
          }]);

        if (error) {
          // Se for erro de conflito (409), significa que foi criada por outra instância
          if (error.code === '23505') { // Unique constraint violation
            console.log('✅ Sala já foi criada por outra instância');
            refetch();
          } else {
            console.error('❌ Erro ao criar sala Comunidade da Elite:', error);
          }
        } else {
          console.log('✅ Sala "Comunidade da Elite" criada com sucesso');
          refetch();
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao criar sala:', error);
      } finally {
        setIsCreating(false);
      }
    };

    createEliteRoom();
  }, [user, eliteRoomExists, isCreating, refetch]);

  return {
    isSetupComplete: eliteRoomExists !== undefined
  };
}; 