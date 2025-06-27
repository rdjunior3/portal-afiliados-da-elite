import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInitialSetup = () => {
  const { user, isAdmin } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const lastExecutionRef = useRef<string | null>(null);

  // Se o usuário não for admin, o hook não faz nada
  if (!isAdmin() || !user) {
    return { isSetupComplete: true };
  }

  // Verificar e criar sala "Comunidade da Elite" se necessário
  const { data: eliteRoomExists, refetch } = useQuery({
    queryKey: ['elite-room-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('name', 'Comunidade da Elite')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('[ERROR] [InitialSetup] Erro ao verificar sala:', error);
        return null;
      }
      
      return !!data;
    },
    enabled: !!user && isAdmin(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1, // Apenas 1 retry
    refetchOnWindowFocus: false, // Não revalidar ao focar janela
    refetchOnReconnect: false, // Não revalidar ao reconectar
    gcTime: 15 * 60 * 1000, // Cache por 15 minutos
  });

  // Criar sala "Comunidade da Elite" se não existir
  useEffect(() => {
    const createEliteRoom = async () => {
      // Verificações de segurança rigorosas
      if (!user || !isAdmin() || eliteRoomExists || isCreating) {
        return;
      }

      // Evitar execuções duplicadas para o mesmo usuário
      const currentExecution = `${user.id}-${Date.now()}`;
      if (lastExecutionRef.current === user.id) {
        console.log('⏳ [InitialSetup] Execução já feita para este usuário');
        return;
      }

      lastExecutionRef.current = user.id;
      setIsCreating(true);
      
      try {
        // Double-check antes de criar
        const { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('name', 'Comunidade da Elite')
          .single();

        if (existingRoom) {
          console.log('[SUCCESS] [InitialSetup] Sala "Comunidade da Elite" já existe');
          await refetch();
          return;
        }

        console.log('🚀 [InitialSetup] Criando sala "Comunidade da Elite"...');
        
        const { error } = await supabase
          .from('chat_rooms')
          .insert([{
            name: 'Comunidade da Elite',
            description: 'Sala oficial da comunidade de afiliados elite. Networking premium e discussões estratégicas.',
            is_active: true
          }]);

        if (error) {
          // Se for erro de conflito, significa que foi criada por outra instância
          if (error.code === '23505') {
            console.log('[SUCCESS] [InitialSetup] Sala já foi criada por outra instância');
          } else {
            console.error('[ERROR] [InitialSetup] Erro ao criar sala:', error);
            // Reset para permitir nova tentativa
            lastExecutionRef.current = null;
          }
        } else {
          console.log('[SUCCESS] [InitialSetup] Sala "Comunidade da Elite" criada com sucesso');
        }

        // Refetch para atualizar o estado
        await refetch();
        
      } catch (error) {
        console.error('[CRASH] [InitialSetup] Erro inesperado:', error);
        // Reset para permitir nova tentativa
        lastExecutionRef.current = null;
      } finally {
        setIsCreating(false);
      }
    };

    // Aguardar um pouco antes de executar para evitar race conditions
    const timeoutId = setTimeout(() => {
      if (eliteRoomExists === false) { // Explicitamente false, não undefined
        createEliteRoom();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
    
  }, [user?.id, eliteRoomExists, isCreating]); // Dependências mais específicas

  return {
    isSetupComplete: eliteRoomExists !== undefined && eliteRoomExists !== null
  };
}; 