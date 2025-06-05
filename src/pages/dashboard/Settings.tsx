import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, User, Camera, Save, Edit } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const SettingsPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState(profile?.avatar_url || '');
  const [displayName, setDisplayName] = useState(profile?.first_name || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: profileImage,
          first_name: displayName
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    }
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
        {/* Profile Settings */}
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
            {/* Profile Image Section */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Label className="text-slate-200 text-sm font-medium">Foto de Perfil</Label>
                <div className="mt-2">
                  {isEditing ? (
                    <ImageUpload
                      value={profileImage}
                      onChange={setProfileImage}
                      bucket="avatars"
                      folder="profiles"
                      label=""
                      placeholder="Envie sua foto de perfil"
                      maxWidth={200}
                      maxHeight={200}
                      className="w-32 h-32"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center bg-slate-700/30">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Sem foto</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="displayName" className="text-slate-200">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-slate-700/60 border-slate-600/50 text-white"
                    placeholder="Seu nome"
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
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
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

          {/* Notification Settings */}
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
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-white font-medium">Email de comissões</p>
                  <p className="text-sm text-slate-400 mt-1">Receber email quando ganhar comissões</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                <p className="text-white font-medium">Notificações no navegador</p>
                <p className="text-sm text-slate-400 mt-1">Alertas em tempo real</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
                <div>
                <p className="text-white font-medium">Relatórios semanais</p>
                <p className="text-sm text-slate-400 mt-1">Resumo semanal por email</p>
                </div>
                <Switch />
              </div>
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
                Alterar Senha
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-red-600/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 backdrop-blur-sm"
            >
              Sair de Todas as Sessões
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SettingsPage; 