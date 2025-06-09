import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error(
    'Supabase URL, Anon Key, ou Service Role Key não estão definidos. Verifique seu arquivo .env'
  );
}

// Usamos a Service Role Key para ter permissões de administrador para o script
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ROOM_NAME_TO_CLEANUP = 'Comunidade da Elite';

async function cleanupDuplicateRooms() {
  console.log(`Iniciando limpeza para salas com nome: "${ROOM_NAME_TO_CLEANUP}"...`);

  // 1. Encontrar todas as salas com o nome especificado
  const { data: rooms, error: fetchError } = await supabase
    .from('chat_rooms')
    .select('id, name, created_at')
    .eq('name', ROOM_NAME_TO_CLEANUP);

  if (fetchError) {
    console.error('Erro ao buscar salas:', fetchError);
    return;
  }

  if (!rooms || rooms.length <= 1) {
    console.log('Nenhuma sala duplicada encontrada. Nenhuma ação necessária.');
    return;
  }

  console.log(`Encontradas ${rooms.length} salas. Verificando mensagens...`);

  // 2. Para cada sala, contar o número de mensagens
  const roomsWithMessageCounts = await Promise.all(
    rooms.map(async (room) => {
      const { count, error: countError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      if (countError) {
        console.error(`Erro ao contar mensagens para a sala ${room.id}:`, countError);
        return { ...room, messageCount: 0 };
      }
      return { ...room, messageCount: count ?? 0 };
    })
  );

  // 3. Ordenar as salas: primeiro por contagem de mensagens, depois pela data de criação
  roomsWithMessageCounts.sort((a, b) => {
    if (b.messageCount !== a.messageCount) {
      return b.messageCount - a.messageCount;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // A primeira sala da lista ordenada é a que vamos manter
  const roomToKeep = roomsWithMessageCounts[0];
  console.log(`Sala a ser mantida: ${roomToKeep.id} (Mensagens: ${roomToKeep.messageCount}, Criada em: ${roomToKeep.created_at})`);

  // As outras são as duplicadas a serem excluídas
  const roomsToDelete = roomsWithMessageCounts.slice(1);
  const idsToDelete = roomsToDelete.map((room) => room.id);

  if (idsToDelete.length === 0) {
    console.log('Nenhuma sala duplicada para deletar. Finalizado.');
    return;
  }

  console.log('Salas a serem excluídas:', idsToDelete);

  // 4. Excluir as salas duplicadas
  const { error: deleteError } = await supabase
    .from('chat_rooms')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error('Erro ao excluir salas duplicadas:', deleteError);
  } else {
    console.log(`Sucesso! ${idsToDelete.length} sala(s) duplicada(s) foram excluídas.`);
  }
}

cleanupDuplicateRooms().catch((e) => console.error('Ocorreu um erro inesperado:', e)); 