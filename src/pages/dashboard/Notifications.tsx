import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, DollarSign, TrendingUp } from 'lucide-react';

const Notifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'Nova comissão recebida',
      message: 'Você ganhou R$ 25,00 de comissão pela venda do Curso Digital Marketing',
      type: 'commission',
      time: '2 horas atrás',
      read: false
    },
    {
      id: 2,
      title: 'Meta mensal atingida!',
      message: 'Parabéns! Você atingiu sua meta de R$ 1.000,00 este mês',
      type: 'achievement',
      time: '1 dia atrás',
      read: false
    },
    {
      id: 3,
      title: 'Pagamento processado',
      message: 'Seu saque de R$ 380,50 foi processado e estará disponível em breve',
      type: 'payment',
      time: '3 dias atrás',
      read: true
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notificações</h1>
          <p className="text-slate-400">
            Acompanhe suas atualizações e alertas importantes
          </p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300">
          <Check className="mr-2 h-4 w-4" />
          Marcar todas como lidas
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors ${!notification.read ? 'border-l-4 border-l-orange-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    {notification.type === 'commission' ? (
                      <DollarSign className="h-5 w-5 text-orange-400" />
                    ) : notification.type === 'achievement' ? (
                      <TrendingUp className="h-5 w-5 text-orange-400" />
                    ) : (
                      <Bell className="h-5 w-5 text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      {!notification.read && (
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                          Nova
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 mb-2">{notification.message}</p>
                    <p className="text-xs text-slate-500">{notification.time}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-slate-400">
              Suas notificações aparecerão aqui
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications; 