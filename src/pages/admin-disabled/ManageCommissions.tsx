import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Search, Webhook, TrendingUp, AlertCircle, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import TrophyIcon from '@/components/ui/TrophyIcon';

const ManageCommissions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Buscar comissões recebidas via webhook
  const { data: commissions, isLoading } = useQuery({
    queryKey: ['admin-commissions', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('commissions')
        .select(`
          *,
          affiliate:profiles!affiliate_id(first_name, last_name, email),
          product:products(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`external_transaction_id.ilike.%${searchQuery}%,affiliate.email.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Aprovada</Badge>;
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Paga</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalCommissions = commissions?.reduce((sum, commission) => sum + Number(commission.amount), 0) || 0;
  const pendingCommissions = commissions?.filter(c => c.status === 'pending').length || 0;
  const paidCommissions = commissions?.filter(c => c.status === 'paid').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 space-y-6">
      {/* Header com design padrão */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                              <TrophyIcon className="w-6 h-6 text-slate-100" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Comissões Recebidas</h1>
              <p className="text-slate-300 mt-1">Visualize comissões recebidas via webhook de plataformas externas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
              <Webhook className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-slate-300">Via Webhook</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total em Comissões</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalCommissions)}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-white">{pendingCommissions}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pagas</p>
                <p className="text-2xl font-bold text-white">{paidCommissions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar por ID da transação ou email do afiliado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white">Todos os Status</SelectItem>
                <SelectItem value="pending" className="text-white">Pendente</SelectItem>
                <SelectItem value="approved" className="text-white">Aprovada</SelectItem>
                <SelectItem value="paid" className="text-white">Paga</SelectItem>
                <SelectItem value="cancelled" className="text-white">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Comissões */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-400" />
            Histórico de Comissões
          </CardTitle>
          <CardDescription className="text-slate-400">
            Comissões recebidas automaticamente via webhook das plataformas de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-slate-400 mt-4">Carregando comissões...</p>
            </div>
          ) : commissions && commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">ID Transação</TableHead>
                    <TableHead className="text-slate-300">Afiliado</TableHead>
                    <TableHead className="text-slate-300">Produto</TableHead>
                    <TableHead className="text-slate-300">Valor</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="text-white font-mono text-sm">
                        {commission.external_transaction_id || commission.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">
                            {commission.affiliate?.first_name} {commission.affiliate?.last_name}
                          </p>
                          <p className="text-sm text-slate-400">{commission.affiliate?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {commission.product?.name || 'Produto não encontrado'}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(commission.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(commission.status)}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(commission.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Webhook className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-400 text-lg mb-2">Nenhuma comissão encontrada</p>
              <p className="text-slate-500 text-sm">
                As comissões aparecerão aqui quando forem recebidas via webhook das plataformas de pagamento
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informação sobre Webhooks */}
      <Card className="bg-blue-500/10 border-blue-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Webhook className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Sistema de Comissões via Webhook</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Este sistema recebe automaticamente informações de comissões e vendas através de webhooks 
                configurados nas plataformas de pagamento externas. Não há processamento de pagamentos 
                interno - apenas visualização e acompanhamento dos dados recebidos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCommissions; 