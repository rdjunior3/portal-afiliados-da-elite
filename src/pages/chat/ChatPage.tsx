import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Hash,
  Circle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  edited: boolean;
  edited_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

const ChatPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Buscar salas de chat
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ChatRoom[];
    }
  });

  // Buscar mensagens da sala selecionada
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, email, first_name, last_name, avatar_url)
        `)
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedRoom
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedRoom || !user) throw new Error('Sala ou usuário não definido');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: selectedRoom.id,
          sender_id: user.id,
          content
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setMessageInput('');
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Configurar realtime para mensagens
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = supabase
      .channel(`room:${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${selectedRoom.id}`
        },
        async (payload) => {
          // Buscar dados completos da mensagem com o sender
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(id, email, first_name, last_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            queryClient.setQueryData(
              ['messages', selectedRoom.id],
              (old: Message[] | undefined) => [...(old || []), newMessage]
            );
            scrollToBottom();
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = new Set<string>();
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence) => {
            if (presence.user_id) {
              users.add(presence.user_id);
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, user, queryClient]);

  // Auto scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Selecionar primeira sala automaticamente
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    sendMessageMutation.mutate(messageInput.trim());
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: ptBR });
  };

  const getUserInitials = (firstName?: string | null, lastName?: string | null, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || '??';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Lista de Salas */}
      <div className="w-80 border-r bg-card/50 backdrop-blur">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            Salas de Chat
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {onlineUsers.size} usuários online
          </p>
        </div>

        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-4 space-y-2">
            {roomsLoading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : (
              rooms?.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedRoom?.id === room.id
                      ? 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Hash className={`h-5 w-5 mt-0.5 ${
                      selectedRoom?.id === room.id ? 'text-orange-500' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{room.name}</p>
                      {room.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-card/50 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <Hash className="h-5 w-5 text-orange-500" />
                    {selectedRoom.name}
                  </h1>
                  {selectedRoom.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Circle className="h-2 w-2 mr-1 fill-current" />
                  {onlineUsers.size} online
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  [...Array(10)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.sender?.avatar_url || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            {getUserInitials(
                              message.sender?.first_name,
                              message.sender?.last_name,
                              message.sender?.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'flex flex-col items-end' : ''}`}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {message.sender?.first_name || message.sender?.email || 'Usuário'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.created_at)}
                            </span>
                            {message.edited && (
                              <span className="text-xs text-muted-foreground">(editado)</span>
                            )}
                          </div>
                          
                          <div className={`rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-orange-500 text-white'
                              : 'bg-secondary'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma mensagem ainda. Seja o primeiro a enviar!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-card/50 backdrop-blur">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Mensagem em #${selectedRoom.name}`}
                  className="flex-1 focus-orange"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="gradient-orange hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                Selecione uma sala para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 