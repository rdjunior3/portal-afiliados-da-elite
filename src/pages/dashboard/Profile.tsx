import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Edit, Sparkles } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Perfil</h1>
          <p className="text-slate-400">
            Gerencie suas informações pessoais e de afiliado
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Edit className="mr-2 h-4 w-4" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{getDisplayName()}</h2>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-sm text-slate-400">Nome</label>
                <p className="text-white">{profile?.first_name || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Sobrenome</label>
                <p className="text-white">{profile?.last_name || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Telefone</label>
                <p className="text-white">Não informado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Status do Afiliado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-orange-400" />
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 mb-2">
                {profile?.affiliate_status === 'approved' ? 'Aprovado' : 'Pendente'}
              </Badge>
              <p className="text-sm text-slate-400">
                ID: {profile?.affiliate_id || 'Aguardando'}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Data de Cadastro</span>
                <span className="text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Links Criados</span>
                <span className="text-white">{profile?.links_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Configurações de Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              <Mail className="mr-2 h-4 w-4" />
              Alterar Email
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              <User className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Preferências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              Notificações
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              Privacidade
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 