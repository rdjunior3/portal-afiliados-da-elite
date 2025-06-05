import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Shield, User, Camera, Save, Edit, Upload, Trash2, X, Plus } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const SettingsPage: React.FC = () => {
  const { profile, user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState(profile?.avatar_url || '');
  const [displayName, setDisplayName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Estados para configurações de notificação
  const [notificationSettings, setNotificationSettings] = useState({
    email_commissions: true,
    email_reports: true,
    browser_notifications: true,
    marketing_emails: false,
    product_updates: true
  });

  // Estados para configurações de privacidade
  const [privacySettings, setPrivacySettings] = useState({
    show_earnings: false,
    show_profile_public: true,
    allow_contact: true
  });
  
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const updateData = {
          avatar_url: profileImage,
        first_name: displayName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim()
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil atualizado! ✅",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage('');
    toast({
      title: "Imagem removida",
      description: "A imagem de perfil foi removida. Clique em salvar para confirmar.",
    });
  };

  return (
    <PageLayout
      fullWidth={true}
      headerContent={
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Configurações"
            description="Gerencie suas preferências e configurações de conta"
            icon="⚙️"
          />
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Settings - Melhorado */}
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Perfil
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Gerencie sua foto de perfil e informações básicas
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-slate-600/50 text-slate-300 hover:border-orange-500 hover:text-orange-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image Section - Redesignado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Label className="text-slate-200 text-sm font-medium">Foto de Perfil</Label>
                
                {/* Preview do Avatar Atual */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-600/50 bg-slate-700/50 flex items-center justify-center">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                    
                    {/* Overlay no hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAvatarModal(true)}
                      disabled={!isEditing}
                      className="border-slate-600/50 text-slate-300 hover:border-orange-500 hover:text-orange-300"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      {profileImage ? 'Alterar' : 'Adicionar'}
                    </Button>
                    
                    {profileImage && isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveImage}
                        className="border-red-600/50 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400 text-center">
                    📸 Tamanho recomendado: 400x400px
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="displayName" className="text-slate-200">Nome *</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-slate-700/60 border-slate-600/50 text-white"
                      placeholder="Seu primeiro nome"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-slate-200">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-slate-700/60 border-slate-600/50 text-white"
                      placeholder="Seu sobrenome"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-200">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-700/60 border-slate-600/50 text-white"
                    placeholder="(11) 99999-9999"
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label className="text-slate-200">Email</Label>
                  <Input
                    value={user?.email || ''}
                    className="bg-slate-700/30 border-slate-600/30 text-slate-400"
                    disabled
                  />
                  <p className="text-xs text-slate-500 mt-1">O email não pode ser alterado</p>
                </div>
                
                <div>
                  <Label className="text-slate-200">ID do Afiliado</Label>
                  <Input
                    value={profile?.affiliate_id || 'Pendente'}
                    className="bg-slate-700/30 border-slate-600/30 text-slate-400"
                    disabled
                  />
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-slate-600/50 text-slate-300"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings - Melhorado */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                Notificações
              </CardTitle>
              <CardDescription className="text-slate-300">
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {[
              {
                key: 'email_commissions',
                title: 'Email de comissões',
                description: 'Receber email quando ganhar comissões',
                value: notificationSettings.email_commissions
              },
              {
                key: 'browser_notifications',
                title: 'Notificações no navegador',
                description: 'Alertas em tempo real no seu navegador',
                value: notificationSettings.browser_notifications
              },
              {
                key: 'email_reports',
                title: 'Relatórios semanais',
                description: 'Resumo semanal de performance por email',
                value: notificationSettings.email_reports
              },
              {
                key: 'product_updates',
                title: 'Atualizações de produtos',
                description: 'Novos produtos e recursos da plataforma',
                value: notificationSettings.product_updates
              },
              {
                key: 'marketing_emails',
                title: 'Emails promocionais',
                description: 'Ofertas especiais e campanhas de marketing',
                value: notificationSettings.marketing_emails
              }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">{setting.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{setting.description}</p>
                </div>
                <Switch 
                  checked={setting.value}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy Settings - Nova seção */}
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                <Shield className="h-4 w-4 text-white" />
              </div>
              Privacidade
            </CardTitle>
            <CardDescription className="text-slate-300">
              Controle a visibilidade das suas informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: 'show_profile_public',
                title: 'Perfil público',
                description: 'Permitir que outros afiliados vejam seu perfil',
                value: privacySettings.show_profile_public
              },
              {
                key: 'show_earnings',
                title: 'Mostrar ganhos',
                description: 'Exibir suas estatísticas de ganhos publicamente',
                value: privacySettings.show_earnings
              },
              {
                key: 'allow_contact',
                title: 'Permitir contato',
                description: 'Outros usuários podem te enviar mensagens',
                value: privacySettings.allow_contact
              }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">{setting.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{setting.description}</p>
                </div>
                <Switch 
                  checked={setting.value}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, [setting.key]: checked }))
                  }
                />
              </div>
            ))}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                Segurança
              </CardTitle>
              <CardDescription className="text-slate-300">
              Mantenha sua conta segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600/50 text-slate-300 hover:border-blue-500 hover:text-blue-300 backdrop-blur-sm"
              >
              🔐 Alterar Senha
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-yellow-600/50 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500 backdrop-blur-sm"
            >
              📱 Configurar 2FA
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-red-600/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 backdrop-blur-sm"
            >
              🚪 Sair de Todas as Sessões
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Upload de Avatar */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-400" />
              Atualizar Foto de Perfil
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Selecione uma nova imagem para seu perfil. A imagem será recortada automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ImageUpload
              value={profileImage}
              onChange={(url) => {
                setProfileImage(url);
                if (url) {
                  toast({
                    title: "Imagem carregada! ✅",
                    description: "Clique em 'Aplicar' para confirmar a alteração.",
                  });
                }
              }}
              bucket="avatars"
              folder="profiles"
              label=""
              placeholder="Clique para selecionar ou arraste uma imagem"
              maxWidth={400}
              maxHeight={400}
              enableCrop={true}
              cropAspect={1}
              className="w-full"
            />
          </div>
          
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowAvatarModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setShowAvatarModal(false);
                toast({
                  title: "Foto atualizada! 📸",
                  description: "Não esqueça de salvar as alterações do perfil.",
                });
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default SettingsPage; 