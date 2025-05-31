import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Banknote, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Payments: React.FC = () => {
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Mock data
  const paymentData = {
    balance: {
      available: 680.50,
      pending: 245.00,
      minimum: 50.00
    },
    methods: [
      {
        id: '1',
        type: 'pix',
        details: 'CPF: ***.***.***-12',
        isDefault: true,
        status: 'active'
      },
      {
        id: '2',
        type: 'bank',
        details: 'Banco do Brasil - AG: 1234-5 CC: ***890',
        isDefault: false,
        status: 'active'
      }
    ],
    history: [
      {
        id: '1',
        amount: 380.50,
        method: 'PIX',
        status: 'completed',
        requestDate: '2024-01-15',
        processedDate: '2024-01-16',
        fee: 7.61
      },
      {
        id: '2',
        amount: 125.00,
        method: 'Transferência Bancária',
        status: 'processing',
        requestDate: '2024-01-20',
        processedDate: null,
        fee: 2.50
      },
      {
        id: '3',
        amount: 95.00,
        method: 'PIX',
        status: 'pending',
        requestDate: '2024-01-22',
        processedDate: null,
        fee: 1.90
      }
    ]
  };

  const statusLabels = {
    completed: { label: 'Concluído', color: 'bg-orange-500/20 text-orange-400', icon: CheckCircle },
    processing: { label: 'Processando', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
    pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount < paymentData.balance.minimum) {
      toast({
        title: "Valor inválido",
        description: `Valor mínimo para saque é R$ ${paymentData.balance.minimum.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > paymentData.balance.available) {
      toast({
        title: "Saldo insuficiente",
        description: "O valor solicitado é maior que o saldo disponível",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Saque solicitado!",
      description: `Solicitação de saque de R$ ${amount.toFixed(2)} foi enviada para processamento.`,
    });
    setWithdrawAmount('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Pagamentos</h1>
            <p className="text-slate-400">
              Gerencie seus saques e métodos de pagamento
            </p>
          </div>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Download className="mr-2 h-4 w-4" />
            Extrato
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {paymentData.balance.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Disponível para Saque</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {paymentData.balance.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Aguardando Processamento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Banknote className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    R$ {paymentData.balance.minimum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Valor Mínimo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Withdraw */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Solicitar Saque</CardTitle>
          <CardDescription>
            Retire seus ganhos para sua conta bancária ou PIX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">Valor do Saque</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0,00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Mín: R$ {paymentData.balance.minimum.toFixed(2)} • 
                Máx: R$ {paymentData.balance.available.toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Método de Pagamento</Label>
              <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-orange-400" />
                    <span className="text-white text-sm">PIX (Padrão)</span>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                    Ativo
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleWithdraw}
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < paymentData.balance.minimum}
              >
                Solicitar Saque
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Métodos de Pagamento</CardTitle>
              <CardDescription>
                Gerencie suas contas para recebimento
              </CardDescription>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Método
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentData.methods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  {method.type === 'pix' ? (
                    <CreditCard className="h-5 w-5 text-orange-400" />
                  ) : (
                    <Banknote className="h-5 w-5 text-orange-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {method.type === 'pix' ? 'PIX' : 'Conta Bancária'}
                  </h3>
                  <p className="text-sm text-slate-400">{method.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {method.isDefault && (
                  <Badge className="bg-blue-500/20 text-blue-400">
                    Padrão
                  </Badge>
                )}
                <Badge className="bg-orange-500/20 text-orange-400">
                  Ativo
                </Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Saques</CardTitle>
          <CardDescription>
            Acompanhe todas as suas solicitações de saque
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentData.history.map((payment) => {
            const StatusIcon = statusLabels[payment.status].icon;
            return (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-lg">
                      R$ {payment.amount.toFixed(2)}
                    </h3>
                    <Badge className={`${statusLabels[payment.status].color} border-0`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusLabels[payment.status].label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Método</p>
                      <p className="text-white">{payment.method}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Taxa</p>
                      <p className="text-white">R$ {payment.fee.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Solicitado em</p>
                      <p className="text-white">
                        {new Date(payment.requestDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">
                        {payment.status === 'completed' ? 'Processado em' : 'Previsão'}
                      </p>
                      <p className="text-white">
                        {payment.processedDate 
                          ? new Date(payment.processedDate).toLocaleDateString('pt-BR')
                          : '2-3 dias úteis'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            ℹ️ Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <p>• Saques via PIX: processados em até 1 hora útil (taxa: 2%)</p>
          <p>• Saques via transferência bancária: 2-3 dias úteis (taxa: 2%)</p>
          <p>• Valor mínimo para saque: R$ 50,00</p>
          <p>• Limite diário: R$ 5.000,00 por método de pagamento</p>
          <p>• Em caso de dúvidas, entre em contato com o suporte</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments; 