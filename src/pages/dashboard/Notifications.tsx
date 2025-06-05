import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, DollarSign, TrendingUp, Package, Settings, Trophy, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'commission':
        return <DollarSign className="h-5 w-5 text-orange-400" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'product':
        return <Package className="h-5 w-5 text-blue-400" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 'system':
        return <Settings className="h-5 w-5 text-slate-400" />;
      default:
        return <Bell className="h-5 w-5 text-orange-400" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'commission':
        return 'bg-orange-500/20';
      case 'payment':
        return 'bg-green-500/20';
      case 'product':
        return 'bg-blue-500/20';
      case 'achievement':
        return 'bg-yellow-500/20';
      case 'system':
        return 'bg-slate-500/20';
      default:
        return 'bg-orange-500/20';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'Agora mesmo';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Notificações</h1>
            <p className="text-slate-400">
              Acompanhe suas atualizações e alertas importantes
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-slate-400">Carregando notificações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notificações</h1>
          <p className="text-slate-400">
            Acompanhe suas atualizações e alertas importantes
            {unreadCount > 0 && (
              <span className="ml-2 text-orange-400">
                ({unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'})
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={markAllAsRead}
          >
            <Check className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer ${
              !notification.is_read ? 'border-l-4 border-l-orange-500' : ''
            }`}
            onClick={() => !notification.is_read && markAsRead(notification.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className={`p-2 ${getNotificationBgColor(notification.type)} rounded-lg`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      {!notification.is_read && (
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                          Nova
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-slate-500">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                      {notification.action_url && notification.action_label && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(notification.action_url, '_blank');
                          }}
                        >
                          {notification.action_label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {!notification.is_read && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-slate-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
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
              Suas notificações aparecerão aqui quando houver atividade em sua conta
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications; 