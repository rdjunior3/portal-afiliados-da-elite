import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Ban, 
  Settings,
  DollarSign,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Affiliate {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  affiliate_id: string | null;
  affiliate_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate: number;
  total_earnings: number;
  created_at: string;
  approved_at: string | null;
}

const ManageAffiliates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [commissionRate, setCommissionRate] = useState('');
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);

  // Buscar afiliados
  const { data: affiliates, isLoading } = useQuery({
    queryKey: ['admin-affiliates', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('affiliate_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Affiliate[];
    }
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      affiliateId, 
      status 
    }: { 
      affiliateId: string; 
      status: 'approved' | 'rejected' | 'suspended' 
    }) => {
      const updateData: any = { affiliate_status: status };
      
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', affiliateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
      toast({
        title: "Status atualizado",
        description: "O status do afiliado foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do afiliado.",
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar comissão
  const updateCommissionMutation = useMutation({
    mutationFn: async ({ 
      affiliateId, 
      rate 
    }: { 
      affiliateId: string; 
      rate: number 
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ commission_rate: rate })
        .eq('id', affiliateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
      toast({
        title: "Comissão atualizada",
        description: "A taxa de comissão foi atualizada com sucesso.",
      });
      setIsCommissionDialogOpen(false);
      setSelectedAffiliate(null);
      setCommissionRate('');
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a taxa de comissão.",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (affiliate: Affiliate, status: 'approved' | 'rejected' | 'suspended') => {
    updateStatusMutation.mutate({ affiliateId: affiliate.id, status });
  };

  const handleCommissionUpdate = () => {
    if (!selectedAffiliate || !commissionRate) return;
    
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Valor inválido",
        description: "A comissão deve ser um valor entre 0 e 100.",
        variant: "destructive",
      });
      return;
    }

    updateCommissionMutation.mutate({ 
      affiliateId: selectedAffiliate.id, 
      rate 
    });
  };

  const openCommissionDialog = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setCommissionRate(affiliate.commission_rate.toString());
    setIsCommissionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejeitado</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-500 text-white">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-orange">
          Gerenciar Afiliados
        </h1>
        <p className="text-muted-foreground mt-2">
          Aprovar, rejeitar ou suspender afiliados e gerenciar suas comissões
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus-orange"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] focus-orange">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabela de Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle>Afiliados</CardTitle>
          <CardDescription>
            Total de {affiliates?.length || 0} afiliados encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : affiliates && affiliates.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ID Afiliado</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Total Ganho</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {affiliate.first_name || affiliate.last_name
                              ? `${affiliate.first_name || ''} ${affiliate.last_name || ''}`.trim()
                              : 'Nome não informado'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {affiliate.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(affiliate.affiliate_status)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          {affiliate.affiliate_id || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {affiliate.commission_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          R$ {affiliate.total_earnings.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(affiliate.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(affiliate.created_at), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {affiliate.affiliate_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusUpdate(affiliate, 'approved')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusUpdate(affiliate, 'rejected')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {affiliate.affiliate_status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-600 hover:text-gray-700"
                              onClick={() => handleStatusUpdate(affiliate, 'suspended')}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(affiliate.affiliate_status === 'rejected' || affiliate.affiliate_status === 'suspended') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusUpdate(affiliate, 'approved')}
                              disabled={updateStatusMutation.isPending}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCommissionDialog(affiliate)}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum afiliado encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Comissão */}
      <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Taxa de Comissão</DialogTitle>
            <DialogDescription>
              Defina a nova taxa de comissão para {selectedAffiliate?.first_name || selectedAffiliate?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Taxa de Comissão (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="Ex: 15.50"
                className="focus-orange"
              />
              <p className="text-sm text-muted-foreground">
                Taxa atual: {selectedAffiliate?.commission_rate}%
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCommissionDialogOpen(false);
                setSelectedAffiliate(null);
                setCommissionRate('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCommissionUpdate}
              disabled={updateCommissionMutation.isPending || !commissionRate}
              className="gradient-orange"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Atualizar Comissão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAffiliates; 