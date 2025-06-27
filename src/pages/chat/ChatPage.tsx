import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Hash,
  Circle,
  Smile,
  Paperclip,
  Image as ImageIcon,
  File,
  Reply,
  MoreVertical,
  Pin,
  Copy,
  Edit3,
  Trash2,
  UserPlus,
  Settings,
  Crown,
  Star,
  Plus,
  Sparkles,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_active: boolean;
  settings?: {
    allow_file_sharing?: boolean;
    allow_reactions?: boolean;
  };
  member_count?: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type?: string;
  file_upload_id?: string;
  reply_to_id?: string;
  is_edited?: boolean;
  edited_at: string | null;
  is_deleted?: boolean;
  created_at: string;
  sender?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role?: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

interface RoomForm {
  name: string;
  description: string;
}

const EMOJI_LIST = ['👍', '👎', '❤️', '😀', '😂', '😮', '😢', '😡', '🎉', '🔥'];

const ChatPage = () => {
  // ChatPage carregada
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState<RoomForm>({
    name: '',
    description: ''
  });

  // Buscar salas de chat
  const { data: rooms = [], isLoading: isLoadingRooms, isError: isErrorRooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: async () => {
          // Buscando salas de chat...
      
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
          // Query de salas executada
      
      if (error) {
        console.error("❌ [ChatRooms] Erro ao buscar salas de chat:", error);
        console.error("❌ [ChatRooms] Código do erro:", error.code);
        console.error("❌ [ChatRooms] Mensagem:", error.message);
        console.error("❌ [ChatRooms] Detalhes completos:", JSON.stringify(error, null, 2));
        return []; // Retorna array vazio em caso de erro
      }
      
      if (data && data.length > 0) {
        console.log('✅ [ChatRooms] Salas carregadas com sucesso:', data.map(room => ({ id: room.id, name: room.name })));
      } else {
        console.log('⚠️ [ChatRooms] Nenhuma sala encontrada no banco de dados');
      }
      
      return data as ChatRoom[];
    }
  });

  // Buscar mensagens da sala selecionada
  const { data: messages = [], isLoading: isLoadingMessages, isError: isErrorMessages } = useQuery({
    queryKey: ['messages', selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) {
        console.error("Erro ao buscar mensagens:", error);
        return [];
      }
      return data as Message[];
    },
    enabled: !!selectedRoom
  });

  // Mutation para criar sala
  const createRoomMutation = useMutation({
    mutationFn: async (data: RoomForm) => {
      if (!isAdmin()) {
        throw new Error('Apenas administradores podem criar salas');
      }
      
      const { error } = await supabase
        .from('chat_rooms')
        .insert([{
          ...data,
          is_active: true
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      setIsRoomModalOpen(false);
      setRoomForm({ name: '', description: '' });
      toast({
        title: "Sala criada!",
        description: "A sala foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a sala.",
        variant: "destructive",
      });
    }
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedRoom || !user) {
        throw new Error('Sala ou usuário não selecionado');
      }
      
      const { error } = await supabase
        .from('messages')
        .insert([{
          room_id: selectedRoom.id,
          sender_id: user.id,
          content: content.trim()
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedRoom?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  });

  // Automatically select "Comunidade da Elite" room or first room
  useEffect(() => {
    console.log('🔄 [ChatRooms] useEffect triggered:', { 
      roomsLength: rooms?.length || 0, 
      hasSelectedRoom: !!selectedRoom,
      rooms: rooms?.map(r => ({ id: r.id, name: r.name })) || []
    });
    
    if (rooms && rooms.length > 0 && !selectedRoom) {
      const eliteRoom = rooms.find(room => room.name === 'Comunidade da Elite');
      const roomToSelect = eliteRoom || rooms[0];
      console.log('🎯 [ChatRooms] Selecionando sala automaticamente:', roomToSelect?.name);
      setSelectedRoom(roomToSelect);
    }
  }, [rooms, selectedRoom]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to real-time messages - OTIMIZADO
  useEffect(() => {
    if (!selectedRoom || !user) return;

    const channel = supabase.channel(`messages-${selectedRoom.id}`, {
      config: {
        broadcast: { self: true },
        presence: { key: user.id }
      }
    })
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${selectedRoom.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedRoom.id] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 [Realtime] Conectado à sala:', selectedRoom.name);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, queryClient, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(newMessage);
  };

  const getDisplayName = (sender: Message['sender']) => {
    if (sender?.first_name && sender?.last_name) {
      return `${sender.first_name} ${sender.last_name}`;
    }
    if (sender?.first_name) {
      return sender.first_name;
    }
    return sender?.email?.split('@')[0] || 'Usuário';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Verificação de segurança definitiva antes de renderizar
  if ((!isLoadingRooms && !Array.isArray(rooms)) || (!isLoadingMessages && !Array.isArray(messages))) {
    console.error("BLOQUEIO DE RENDERIZAÇÃO: 'rooms' ou 'messages' não são arrays após o carregamento.", { rooms, messages });
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold">Erro Crítico de Dados</h1>
          <p>Não foi possível carregar os dados do chat. Verifique o console para mais detalhes.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Card className="p-8 bg-slate-800 border-slate-700">
          <CardContent className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Acesso Restrito</h3>
            <p className="text-slate-400">Você precisa estar logado para acessar o chat.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex">
      {/* Sidebar - Chat Rooms */}
      <div className="w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Chat Elite</h1>
                <p className="text-sm text-orange-300">Comunidade Premium</p>
              </div>
            </div>
            
            {isAdmin() && (
              <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Criar Nova Sala</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Crie uma nova sala de chat para a comunidade
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="room_name" className="text-right text-slate-200">Nome</Label>
                      <Input
                        id="room_name"
                        value={roomForm.name}
                        onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                        className="col-span-3 bg-slate-700 border-slate-600 text-white"
                        placeholder="Nome da sala"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="room_description" className="text-right text-slate-200">Descrição</Label>
                      <Textarea
                        id="room_description"
                        value={roomForm.description}
                        onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                        className="col-span-3 bg-slate-700 border-slate-600 text-white"
                        placeholder="Descrição da sala (opcional)"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      onClick={() => createRoomMutation.mutate(roomForm)}
                      disabled={createRoomMutation.isPending || !roomForm.name.trim()}
                      className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white"
                    >
                      Criar Sala
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingRooms ? (
            <div className="space-y-2">
              {console.log('🔄 [ChatRooms] Carregando salas...')}
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-slate-700/50 h-16 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>

              {Array.isArray(rooms) && rooms.length > 0 ? (
                rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    "w-full p-4 text-left rounded-lg transition-all duration-200 group",
                    selectedRoom?.id === room.id
                      ? "bg-gradient-to-r from-orange-500/30 to-orange-600/20 border border-orange-400/30"
                      : "bg-slate-700/30 hover:bg-slate-700/50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      room.name === 'Comunidade da Elite' 
                        ? "bg-gradient-to-r from-orange-400 to-orange-500" 
                        : "bg-slate-600"
                    )}>
                      {room.name === 'Comunidade da Elite' ? (
                        <Crown className="h-5 w-5 text-white" />
                      ) : (
                        <Hash className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-semibold truncate",
                          selectedRoom?.id === room.id ? "text-white" : "text-slate-200"
                        )}>
                          {room.name}
                        </h3>
                        {room.name === 'Comunidade da Elite' && (
                          <Sparkles className="h-4 w-4 text-orange-400" />
                        )}
                      </div>
                      {room.description && (
                        <p className={cn(
                          "text-sm truncate",
                          selectedRoom?.id === room.id ? "text-orange-200" : "text-slate-400"
                        )}>
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-sm">
                    {isErrorRooms ? 'Erro ao carregar salas' : 'Nenhuma sala disponível'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-700 bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  selectedRoom.name === 'Comunidade da Elite' 
                    ? "bg-gradient-to-r from-orange-400 to-orange-500" 
                    : "bg-slate-600"
                )}>
                  {selectedRoom.name === 'Comunidade da Elite' ? (
                    <Crown className="h-6 w-6 text-white" />
                  ) : (
                    <Hash className="h-6 w-6 text-slate-300" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedRoom.name}</h2>
                    {selectedRoom.name === 'Comunidade da Elite' && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/50">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  {selectedRoom.description && (
                    <p className="text-slate-400">{selectedRoom.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
              <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="bg-slate-700 h-4 w-24 rounded mb-2"></div>
                        <div className="bg-slate-700 h-16 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : Array.isArray(messages) && messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-4 group">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={message.sender?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-bold">
                        {getInitials(getDisplayName(message.sender))}
                          </AvatarFallback>
                        </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {getDisplayName(message.sender)}
                            </span>
                        {message.sender?.role === 'admin' && (
                          <Badge variant="outline" className="text-xs border-orange-400/60 text-orange-300 bg-orange-500/10">
                            <Crown className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                            </span>
                          </div>
                      <div className="bg-slate-700/50 rounded-lg p-3 text-slate-200">
                              {message.content}
                          </div>
                        </div>
                      </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto text-slate-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Nenhuma mensagem ainda</h3>
                    <p className="text-slate-400">Seja o primeiro a iniciar a conversa!</p>
                  </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

            {/* Message Input */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/30">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Selecione uma sala</h3>
              <p className="text-slate-400">Escolha uma sala para começar a conversar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 