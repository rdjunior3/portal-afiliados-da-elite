import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, CreditCard, User, Palette, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SettingsPage: React.FC = () => {
  return (
    <PageLayout
      fullWidth={true}
      headerContent={
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Configurações"
            description="Personalize sua experiência no portal elite"
            icon="⚙️"
          />
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Notification Settings */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                Notificações
              </CardTitle>
              <CardDescription className="text-slate-300">
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">Email de comissões</p>
                  <p className="text-sm text-slate-400 mt-1">Receber email quando ganhar comissões</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">Notificações push</p>
                  <p className="text-sm text-slate-400 mt-1">Alertas no navegador</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">Relatórios mensais</p>
                  <p className="text-sm text-slate-400 mt-1">Resumo mensal por email</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                Segurança
              </CardTitle>
              <CardDescription className="text-slate-300">
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-blue-500 hover:text-blue-300 backdrop-blur-sm"
              >
                Alterar Senha
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-blue-500 hover:text-blue-300 backdrop-blur-sm"
              >
                Autenticação de Dois Fatores
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-blue-500 hover:text-blue-300 backdrop-blur-sm"
              >
                Sessões Ativas
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                Conta
              </CardTitle>
              <CardDescription className="text-slate-300">
                Configurações gerais da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-green-500 hover:text-green-300 backdrop-blur-sm"
              >
                Editar Perfil
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-green-500 hover:text-green-300 backdrop-blur-sm"
              >
                Métodos de Pagamento
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-red-600/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 backdrop-blur-sm"
              >
                Excluir Conta
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                Aparência
              </CardTitle>
              <CardDescription className="text-slate-300">
                Personalize a interface do portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">Modo escuro</p>
                  <p className="text-sm text-slate-400 mt-1">Interface com tema escuro</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">Animações</p>
                  <p className="text-sm text-slate-400 mt-1">Efeitos visuais e transições</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                Financeiro
              </CardTitle>
              <CardDescription className="text-slate-300">
                Gerencie seus dados financeiros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-emerald-500 hover:text-emerald-300 backdrop-blur-sm"
              >
                Dados Bancários
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-emerald-500 hover:text-emerald-300 backdrop-blur-sm"
              >
                Configurações de PIX
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-emerald-500 hover:text-emerald-300 backdrop-blur-sm"
              >
                Histórico de Pagamentos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="bg-red-950/20 border-red-900/50 backdrop-blur-sm shadow-lg shadow-red-500/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-red-400 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              Zona de Perigo
            </CardTitle>
            <CardDescription className="text-red-300">
              Ações irreversíveis que afetam permanentemente sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="border-red-600/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 backdrop-blur-sm"
            >
              Excluir Conta Permanentemente
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SettingsPage; 