import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Search,
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

const Commissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const commissionsData = {
    summary: {
      totalEarned: 2450.00,
      pendingPayment: 680.50,
      thisMonth: 1250.00,
      avgCommission: 25.50
    },
    commissions: [
      {
        id: '1',
        productName: 'Curso Digital Marketing',
        customerEmail: 'cliente@example.com',
        saleValue: 297.00,
        commissionRate: 30,
        commissionValue: 89.10,
        status: 'paid',
        date: '2024-01-15',
        paymentDate: '2024-01-20'
      },
      {
        id: '2',
        productName: 'E-book SEO Avançado',
        customerEmail: 'user@test.com',
        saleValue: 97.00,
        commissionRate: 25,
        commissionValue: 24.25,
        status: 'pending',
        date: '2024-01-18',
        paymentDate: null
      },
      {
        id: '3',
        productName: 'Software Analytics',
        customerEmail: 'analytics@user.com',
        saleValue: 497.00,
        commissionRate: 20,
        commissionValue: 99.40,
        status: 'processing',
        date: '2024-01-20',
        paymentDate: null
      }
    ]
  };

  const statusConfig = {
    pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    paid: { label: 'Pago', color: 'bg-orange-500/20 text-orange-400', icon: CheckCircle },
    processing: { label: 'Processando', color: 'bg-blue-500/20 text-blue-400', icon: AlertCircle },
    cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  };

  const filteredCommissions = commissionsData.commissions.filter(commission => {
    const matchesSearch = commission.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Comissões</h1>
            <p className="text-slate-400">
              Acompanhe seus ganhos e histórico de comissões
            </p>
          </div>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {commissionsData.summary.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Total Ganho</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {commissionsData.summary.pendingPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Pendente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {commissionsData.summary.thisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Este Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {commissionsData.summary.avgCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Média por Venda</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por produto ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "border-slate-600 text-slate-300"
                }
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'paid' ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter('paid')}
                className={statusFilter === 'paid' 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "border-slate-600 text-slate-300"
                }
              >
                Pagos
              </Button>
              <Button
                variant={statusFilter === 'pending' ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "border-slate-600 text-slate-300"
                }
              >
                Pendentes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions List */}
      <div className="space-y-4">
        {filteredCommissions.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm ? 'Nenhuma comissão encontrada' : 'Nenhuma comissão ainda'}
              </h3>
              <p className="text-slate-400">
                {searchTerm 
                  ? 'Tente ajustar sua busca ou filtros'
                  : 'Suas comissões aparecerão aqui conforme você gerar vendas'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCommissions.map((commission) => {
            const StatusIcon = statusConfig[commission.status].icon;
            return (
              <Card key={commission.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Product and Customer */}
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          {commission.productName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Cliente: {commission.customerEmail}
                        </p>
                      </div>

                      {/* Sale Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Valor da Venda</p>
                          <p className="text-white font-semibold">
                            R$ {commission.saleValue.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Taxa Comissão</p>
                          <p className="text-white font-semibold">{commission.commissionRate}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Data da Venda</p>
                          <p className="text-white font-semibold">
                            {new Date(commission.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">
                            {commission.status === 'paid' ? 'Data do Pagamento' : 'Previsão Pagamento'}
                          </p>
                          <p className="text-white font-semibold">
                            {commission.paymentDate 
                              ? new Date(commission.paymentDate).toLocaleDateString('pt-BR')
                              : 'A definir'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Commission Value and Status */}
                    <div className="text-right ml-6">
                      <div className="mb-3">
                        <p className="text-2xl font-bold text-orange-400">
                          R$ {commission.commissionValue.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400">Sua comissão</p>
                      </div>
                      
                      <Badge className={`${statusConfig[commission.status].color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[commission.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Payment Info */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            💰 Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <p>• Pagamentos são processados toda segunda-feira para comissões com mais de 7 dias</p>
          <p>• Valor mínimo para saque: R$ 50,00</p>
          <p>• Taxa de processamento: 2% sobre o valor total</p>
          <p>• Prazo para compensação: 2-3 dias úteis após o processamento</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Commissions; 