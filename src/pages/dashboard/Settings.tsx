import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, CreditCard, User, Palette, AlertTriangle } from 'lucide-react';
import { EliteCard, EliteGrid, EliteText, EliteButton } from '@/lib/elite-styles';
import { cn } from '@/lib/utils';

const SettingsPage: React.FC = () => {
  return (
    <PageLayout
      headerContent={
        <PageHeader
          title="Configurações"
          description="Personalize sua experiência no portal elite"
          icon="⚙️"
        />
      }
    >
      {/* Settings Grid */}
      <div className={EliteGrid.settings}>
        {/* Notification Settings */}
        <Card className={EliteCard.primary}>
          <CardHeader>
            <CardTitle className={cn(EliteText.subtitle, "flex items-center gap-3")}>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              Notificações
            </CardTitle>
            <CardDescription className={EliteText.description}>
              Configure como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Email de comissões</p>
                <p className={cn(EliteText.small, "mt-1")}>Receber email quando ganhar comissões</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Notificações push</p>
                <p className={cn(EliteText.small, "mt-1")}>Alertas no navegador</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Relatórios mensais</p>
                <p className={cn(EliteText.small, "mt-1")}>Resumo mensal por email</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className={EliteCard.primary}>
          <CardHeader>
            <CardTitle className={cn(EliteText.subtitle, "flex items-center gap-3")}>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              Segurança
            </CardTitle>
            <CardDescription className={EliteText.description}>
              Gerencie a segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className={cn(EliteButton.secondary, "w-full justify-start")}
            >
              Alterar Senha
            </Button>
            <Button 
              variant="outline" 
              className={cn(EliteButton.secondary, "w-full justify-start")}
            >
              Autenticação de Dois Fatores
            </Button>
            <Button 
              variant="outline" 
              className={cn(EliteButton.secondary, "w-full justify-start")}
            >
              Sessões Ativas
            </Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className={EliteCard.primary}>
          <CardHeader>
            <CardTitle className={cn(EliteText.subtitle, "flex items-center gap-3")}>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              Conta
            </CardTitle>
            <CardDescription className={EliteText.description}>
              Configurações gerais da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className={cn(EliteButton.secondary, "w-full justify-start")}
            >
              Editar Perfil
            </Button>
            <Button 
              variant="outline" 
              className={cn(EliteButton.secondary, "w-full justify-start")}
            >
              Métodos de Pagamento
            </Button>
            <Button 
              variant="outline" 
              className={cn(EliteButton.danger, "w-full justify-start")}
            >
              Excluir Conta
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className={EliteCard.primary}>
          <CardHeader>
            <CardTitle className={cn(EliteText.subtitle, "flex items-center gap-3")}>
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Palette className="h-4 w-4 text-white" />
              </div>
              Aparência
            </CardTitle>
            <CardDescription className={EliteText.description}>
              Personalize a interface do portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Modo escuro</p>
                <p className={cn(EliteText.small, "mt-1")}>Interface com tema escuro</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">Animações</p>
                <p className={cn(EliteText.small, "mt-1")}>Efeitos visuais e transições</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-red-950/20 border-red-900/50 shadow-lg shadow-red-500/10">
        <CardHeader>
          <CardTitle className={cn(EliteText.subtitle, "text-red-400 flex items-center gap-3")}>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
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
            className={cn(EliteButton.danger, "border-red-600 text-red-400 hover:bg-red-500/20")}
          >
            Excluir Conta Permanentemente
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default SettingsPage; 