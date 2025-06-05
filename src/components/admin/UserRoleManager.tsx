import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Crown, 
  Star, 
  Users, 
  Shield, 
  Search,
  UserPlus,
  UserMinus,
  MoreVertical,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'affiliate' | 'moderator' | 'admin' | 'super_admin';
  affiliate_status: string | null;
  is_verified: boolean;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
  total_earnings: number;
  total_clicks: number;
  total_conversions: number;
}

const UserRoleManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Buscar usuários
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as User[];
    }
  });

  // Mutation para atualizar role
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Role atualizada!",
        description: "A role do usuário foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a role do usuário.",
        variant: "destructive",
      });
    }
  });

  // Mutation para verificar usuário
  const verifyUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Usuário verificado!",
        description: "O usuário foi verificado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const getRoleInfo = (role: string) => {
    const roleConfig = {
      super_admin: { 
        label: 'Super Admin', 
        color: 'bg-red-500 text-white', 
        icon: Crown,
        description: 'Acesso completo ao sistema'
      },
      admin: { 
        label: 'Admin', 
        color: 'bg-purple-500 text-white', 
        icon: Star,
        description: 'Gerenciamento de usuários e produtos'
      },
      moderator: { 
        label: 'Moderador', 
        color: 'bg-blue-500 text-white', 
        icon: Shield,
        description: 'Moderação de conteúdo e suporte'
      },
      affiliate: { 
        label: 'Afiliado', 
        color: 'bg-green-500 text-white', 
        icon: UserPlus,
        description: 'Pode promover produtos'
      },
      user: { 
        label: 'Usuário', 
        color: 'bg-gray-500 text-white', 
        icon: Users,
        description: 'Acesso básico'
      }
    };

    return roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
  };

  const canPromoteToRole = (targetRole: string) => {
    if (!currentUser) return false;
    
    // Apenas super_admin pode promover para admin ou super_admin
    if (targetRole === 'admin' || targetRole === 'super_admin') {
      return currentUser.user_metadata?.role === 'super_admin';
    }
    
    // Admin e super_admin podem promover para moderator
    if (targetRole === 'moderator') {
      return ['admin', 'super_admin'].includes(currentUser.user_metadata?.role);
    }
    
    return true;
  };

  const getUserInitials = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (user: User) => {
    if (user.first_name) {
      return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
    }
    return user.email;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient-orange">
            Gerenciar Usuários
          </h1>
          <p className="text-muted-foreground mt-2">
            Controle de roles, permissões e verificações de usuários
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus-orange"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[200px] focus-orange">
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderador</SelectItem>
              <SelectItem value="affiliate">Afiliado</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['super_admin', 'admin', 'moderator', 'affiliate'].map((role) => {
          const roleInfo = getRoleInfo(role);
          const count = users?.filter(u => u.role === role).length || 0;
          
          return (
            <Card key={role} className="hover-lift">
              <CardContent className="flex items-center p-6">
                <div className={`p-3 rounded-lg ${roleInfo.color} mr-4`}>
                  <roleInfo.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{roleInfo.label}s</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {users?.length || 0} usuários encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última atividade</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ))
              ) : users && users.length > 0 ? (
                users.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getUserDisplayName(user)}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={roleInfo.color}>
                          <roleInfo.icon className="h-3 w-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.is_verified ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                          
                          {user.affiliate_status === 'approved' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Afiliado Ativo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {user.last_login_at ? (
                            <>
                              <p>{format(new Date(user.last_login_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                              <p className="text-muted-foreground">{user.login_count} logins</p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">Nunca fez login</p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {user.role === 'affiliate' ? (
                          <div className="text-sm space-y-1">
                            <p>{formatCurrency(user.total_earnings || 0)}</p>
                            <p className="text-muted-foreground">
                              {user.total_clicks || 0} cliques • {user.total_conversions || 0} conversões
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            
                            {!user.is_verified && (
                              <DropdownMenuItem
                                onClick={() => verifyUserMutation.mutate(user.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verificar usuário
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Alterar Role</DropdownMenuLabel>
                            
                            {['affiliate', 'moderator', 'admin'].map((role) => {
                              if (role === user.role || !canPromoteToRole(role)) return null;
                              
                              const roleInfo = getRoleInfo(role);
                              
                              return (
                                <AlertDialog key={role}>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <roleInfo.icon className="h-4 w-4 mr-2" />
                                      Promover para {roleInfo.label}
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar Promoção</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja promover <strong>{getUserDisplayName(user)}</strong> para <strong>{roleInfo.label}</strong>?
                                        <br /><br />
                                        {roleInfo.description}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => updateUserRoleMutation.mutate({
                                          userId: user.id,
                                          newRole: role
                                        })}
                                        className="gradient-orange"
                                      >
                                        Confirmar Promoção
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              );
                            })}
                            
                            {user.role !== 'user' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Rebaixar para Usuário
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Rebaixamento</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja rebaixar <strong>{getUserDisplayName(user)}</strong> para usuário comum?
                                      <br /><br />
                                      Esta ação removerá todas as permissões especiais.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateUserRoleMutation.mutate({
                                        userId: user.id,
                                        newRole: 'user'
                                      })}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Confirmar Rebaixamento
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManager; 