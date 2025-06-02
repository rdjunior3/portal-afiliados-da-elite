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
  Star
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
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const EMOJI_LIST = ['👍', '👎', '❤️', '😀', '😂', '😮', '😢', '😡', '🎉', '🔥'];

const ChatPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

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
          sender:profiles(id, email, first_name, last_name, avatar_url, role)
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
    mutationFn: async ({ content, replyToId }: { content: string; replyToId?: string }) => {
      if (!selectedRoom || !user) throw new Error('Sala ou usuário não definido');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: selectedRoom.id,
          sender_id: user.id,
          content,
          reply_to_id: replyToId,
          message_type: 'text'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setMessageInput('');
      setReplyingTo(null);
      setIsMultiline(false);
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

  // Configurar realtime
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
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(id, email, first_name, last_name, avatar_url, role)
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

  // Auto scroll
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
    
    sendMessageMutation.mutate({ 
      content: messageInput.trim(),
      replyToId: replyingTo?.id
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMultiline) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ptBR });
    } else if (isYesterday(date)) {
      return `Ontem ${format(date, 'HH:mm', { locale: ptBR })}`;
    } else {
      return format(date, 'dd/MM HH:mm', { locale: ptBR });
    }
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

  const getUserDisplayName = (user: any) => {
    if (user?.first_name) {
      return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const getRoleBadge = (role?: string) => {
    const roleConfig = {
      super_admin: { label: 'Super Admin', color: 'bg-red-500', icon: Crown },
      admin: { label: 'Admin', color: 'bg-purple-500', icon: Star },
      moderator: { label: 'Mod', color: 'bg-blue-500', icon: Star },
      affiliate: { label: 'Afiliado', color: 'bg-green-500', icon: null },
      user: { label: '', color: '', icon: null }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    
    if (!config.label) return null;
    
    return (
      <Badge className={`text-xs ${config.color} text-white flex items-center gap-1`}>
        {config.icon && <config.icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Sidebar - Lista de Salas */}
        <div className="w-80 border-r bg-gradient-to-b from-card/80 to-card/50 backdrop-blur-sm">
          <div className="p-6 border-b bg-gradient-to-r from-orange-500/10 to-orange-600/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gradient-orange">
                <MessageSquare className="h-6 w-6 text-orange-500" />
                Comunidade Elite
              </h2>
              <Button variant="ghost" size="sm" className="hover:bg-orange-100 dark:hover:bg-orange-900/30">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Circle className="h-2 w-2 fill-current text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {onlineUsers.size} online
                </span>
              </div>
              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
              <span className="text-sm text-muted-foreground">
                {rooms?.length || 0} salas
              </span>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-6rem)]">
            <div className="p-4 space-y-2">
              {roomsLoading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : (
                rooms?.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:scale-[1.02] hover:shadow-lg ${
                      selectedRoom?.id === room.id
                        ? 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-700 shadow-md'
                        : 'bg-card/50 border border-border/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedRoom?.id === room.id 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Hash className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-semibold truncate ${
                            selectedRoom?.id === room.id 
                              ? 'text-orange-700 dark:text-orange-300' 
                              : 'text-foreground'
                          }`}>
                            {room.name}
                          </p>
                          <Circle className="h-2 w-2 fill-current text-green-500 flex-shrink-0" />
                        </div>
                        {room.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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
        <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-background/95">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-orange-500 text-white">
                        <Hash className="h-5 w-5" />
                      </div>
                      <span className="text-gradient-orange">{selectedRoom.name}</span>
                    </h1>
                    {selectedRoom.description && (
                      <p className="text-muted-foreground mt-2 ml-11">
                        {selectedRoom.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-orange-600 border-orange-600 px-3 py-1">
                      <Circle className="h-2 w-2 mr-2 fill-current animate-pulse" />
                      {onlineUsers.size} online
                    </Badge>
                    <Button variant="outline" size="sm" className="hover:bg-orange-50 dark:hover:bg-orange-900/30">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Convidar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reply Banner */}
              {replyingTo && (
                <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <Reply className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Respondendo a {getUserDisplayName(replyingTo.sender)}</span>
                    <span className="text-muted-foreground truncate max-w-96 bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                      {replyingTo.content}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    ✕
                  </Button>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {messagesLoading ? (
                    [...Array(10)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-20 w-full rounded-xl" />
                        </div>
                      </div>
                    ))
                  ) : messages && messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isOwnMessage = message.sender_id === user?.id;
                      const showAvatar = index === 0 || 
                        messages[index - 1].sender_id !== message.sender_id ||
                        new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000;
                      
                      return (
                        <div
                          key={message.id}
                          className={`group flex gap-4 hover:bg-secondary/30 px-3 py-2 rounded-xl transition-all duration-200 ${
                            isOwnMessage ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-800">
                                <AvatarImage src={message.sender?.avatar_url || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 font-semibold">
                                  {getUserInitials(
                                    message.sender?.first_name,
                                    message.sender?.last_name,
                                    message.sender?.email
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-12" />
                            )}
                          </div>
                          
                          <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'flex flex-col items-end' : ''}`}>
                            {showAvatar && (
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-base font-semibold">
                                  {getUserDisplayName(message.sender)}
                                </span>
                                {getRoleBadge(message.sender?.role)}
                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                  {formatMessageTime(message.created_at)}
                                </span>
                                {message.is_edited && (
                                  <span className="text-xs text-muted-foreground italic">(editado)</span>
                                )}
                              </div>
                            )}
                            
                            <div className={`rounded-2xl p-4 relative shadow-sm transition-all duration-200 hover:shadow-md ${
                              isOwnMessage
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                                : 'bg-gradient-to-br from-card to-card/80 border border-border/50'
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              
                              {/* Message Actions */}
                              <div className={`absolute -top-2 ${isOwnMessage ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full shadow-lg">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                                      <Reply className="h-4 w-4 mr-2" />
                                      Responder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      navigator.clipboard.writeText(message.content);
                                      toast({ title: "Mensagem copiada!" });
                                    }}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Copiar
                                    </DropdownMenuItem>
                                    {isOwnMessage && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                          <Edit3 className="h-4 w-4 mr-2" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            {/* Quick Reactions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                              <div className="flex gap-1">
                                {['👍', '❤️', '😂'].map((emoji) => (
                                  <Button
                                    key={emoji}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-sm hover:scale-110 transition-transform"
                                  >
                                    {emoji}
                                  </Button>
                                ))}
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                  <Smile className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16">
                      <div className="p-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <MessageSquare className="h-12 w-12 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Seja o primeiro!</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Nenhuma mensagem foi enviada ainda. Comece a conversa e conecte-se com a comunidade.
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="space-y-4 max-w-4xl mx-auto">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      {isMultiline ? (
                        <Textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Compartilhe suas ideias em #${selectedRoom.name}...`}
                          className="min-h-[100px] focus-orange resize-none rounded-2xl border-2 text-base p-4"
                          disabled={sendMessageMutation.isPending}
                        />
                      ) : (
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Mensagem em #${selectedRoom.name}...`}
                          className="focus-orange pr-24 h-12 rounded-2xl border-2 text-base"
                          disabled={sendMessageMutation.isPending}
                        />
                      )}
                      
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30"
                              onClick={() => setIsMultiline(!isMultiline)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isMultiline ? 'Modo linha única' : 'Modo múltiplas linhas'}
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30"
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Anexar arquivo</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="gradient-orange hover:opacity-90 h-12 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                  
                  {isMultiline && (
                    <p className="text-xs text-muted-foreground text-center bg-muted/30 py-2 px-4 rounded-xl">
                      💡 Pressione <kbd className="bg-muted px-1 rounded">Shift + Enter</kbd> para quebrar linha, <kbd className="bg-muted px-1 rounded">Enter</kbd> para enviar
                    </p>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="p-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                  <MessageSquare className="h-16 w-16 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gradient-orange">
                  Bem-vindo à Comunidade Elite
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Selecione uma sala de chat para começar a conversar com outros afiliados e compartilhar estratégias de sucesso.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatPage; 