import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, CreditCard, User, Palette } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400">
            Personalize sua experiência no portal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Email de comissões</p>
                <p className="text-sm text-slate-400">Receber email quando ganhar comissões</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Notificações push</p>
                <p className="text-sm text-slate-400">Alertas no navegador</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Relatórios mensais</p>
                <p className="text-sm text-slate-400">Resumo mensal por email</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-400" />
              Segurança
            </CardTitle>
            <CardDescription>
              Gerencie a segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              Autenticação de Dois Fatores
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              Sessões Ativas
            </Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-orange-400" />
              Conta
            </CardTitle>
            <CardDescription>
              Configurações gerais da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              Editar Perfil
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
              Métodos de Pagamento
            </Button>
            <Button variant="outline" className="w-full justify-start border-red-600 text-red-400 hover:bg-red-500/10">
              Excluir Conta
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-orange-400" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a interface do portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Modo escuro</p>
                <p className="text-sm text-slate-400">Interface com tema escuro</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Animações</p>
                <p className="text-sm text-slate-400">Efeitos visuais e transições</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-red-950/20 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam permanentemente sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-500/10">
            Excluir Conta Permanentemente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 