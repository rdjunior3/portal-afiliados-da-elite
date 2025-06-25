import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatGuardProps {
  children: React.ReactNode;
}

const ChatGuard: React.FC<ChatGuardProps> = ({ children }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Se o usuário não tem status aprovado, mostrar mensagem de bloqueio
  if (profile?.affiliate_status !== 'approved') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-full flex items-center justify-center border border-orange-500/30">
              <Lock className="h-8 w-8 text-orange-400" />
            </div>
            <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Chat Elite Bloqueado
            </CardTitle>
            <CardDescription className="text-slate-300">
              Complete seu perfil para desbloquear o acesso ao chat exclusivo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-orange-100 font-medium mb-2">
                    Para acessar o Chat Elite você precisa:
                  </h4>
                  <ul className="text-sm text-orange-200 space-y-1">
                    <li>• Completar todas as informações do seu perfil</li>
                    <li>• Ter status de Afiliado Ativo</li>
                    <li>• Aceitar os termos de uso da plataforma</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-slate-300">
                <strong>Status atual:</strong>{' '}
                <span className={`font-medium ${
                  profile?.affiliate_status === 'pending' ? 'text-yellow-400' : 
                  profile?.affiliate_status === 'approved' ? 'text-green-400' : 
                  'text-red-400'
                }`}>
                  {profile?.affiliate_status === 'pending' ? 'Pendente' :
                   profile?.affiliate_status === 'approved' ? 'Aprovado' :
                   profile?.affiliate_status === 'rejected' ? 'Rejeitado' :
                   profile?.affiliate_status === 'suspended' ? 'Suspenso' : 'Inativo'}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/dashboard/settings')}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completar Perfil
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:border-orange-500 hover:text-orange-300"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o usuário está aprovado, renderiza o chat
  return <>{children}</>;
};

export default ChatGuard; 