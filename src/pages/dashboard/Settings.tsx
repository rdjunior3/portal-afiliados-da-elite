import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, Shield, User, Camera, Save, Edit, Upload, Trash2, X, Plus, 
  Phone, Mail, MapPin, Sparkles, Globe, Instagram, Youtube, Linkedin, Key
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TrophyIcon from '@/components/ui/TrophyIcon';

const SettingsPage: React.FC = () => {
  const { profile, user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Estados consolidados para todas as configurações
  const [formData, setFormData] = useState({
    // Dados pessoais
    first_name: '',
    last_name: '',
    username: '', // Novo campo para ID
    phone: '',
    avatar_url: '',
    bio: '',
    city: '',
    state: '',
    country: 'Brasil',
    
    // Redes sociais
    social_instagram: '',
    social_youtube: '',
    social_linkedin: '',
    
    // Preferências de notificação
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    commission_alerts: true,
  });

  // Atualizar formData quando o perfil do usuário for carregado
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || 'Brasil',
        // Desestruturar de colunas JSON
        social_instagram: profile.social_media?.instagram || '',
        social_youtube: profile.social_media?.youtube || '',
        social_linkedin: profile.social_media?.linkedin || '',
        email_notifications: profile.notification_settings?.email_notifications ?? true,
        sms_notifications: profile.notification_settings?.sms_notifications ?? false,
        marketing_emails: profile.notification_settings?.marketing_emails ?? true,
        commission_alerts: profile.notification_settings?.commission_alerts ?? true,
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const handleSaveProfile = async () => {
    if (!formData.first_name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O campo Nome é obrigatório para completar o perfil.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.username.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O campo ID (apelido) é obrigatório para completar o perfil.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const updateData = {
        // Campos diretos
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim().toLowerCase(), // Salvar em minúsculas para consistência
        full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        phone: formData.phone.trim(),
        avatar_url: formData.avatar_url,
        bio: formData.bio.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country,

        // Agrupar em objetos JSON para o banco
        social_media: {
          instagram: formData.social_instagram.trim(),
          youtube: formData.social_youtube.trim(),
          linkedin: formData.social_linkedin.trim(),
        },
        notification_settings: {
          email_notifications: formData.email_notifications,
          sms_notifications: formData.sms_notifications,
          marketing_emails: formData.marketing_emails,
          commission_alerts: formData.commission_alerts,
        },
        
        // Marcar que o perfil foi completado se os campos essenciais estiverem preenchidos
        onboarding_completed_at: (formData.first_name && formData.username) ? new Date().toISOString() : null
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        if (error.message.includes('profiles_username_key')) {
           toast({
            title: "ID já em uso",
            description: "Este ID (apelido) já pertence a outro usuário. Por favor, escolha um diferente.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Configurações salvas! ✅",
          description: "Suas informações foram atualizadas com sucesso.",
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    toast({
      title: "Imagem removida",
      description: "A imagem de perfil foi removida. Clique em salvar para confirmar.",
    });
  };

  const renderPersonalTab = () => (
    <div className="space-y-8">
      {/* Header com Avatar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-600/50 bg-slate-700/50 flex items-center justify-center">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <TrophyIcon className="w-16 h-16" color="#f97316" />
              )}
            </div>
            
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAvatarModal(true)}
                className="border-slate-600/50 text-slate-300 hover:border-orange-500 hover:text-orange-300"
              >
                <Upload className="h-3 w-3 mr-1" />
                {formData.avatar_url ? 'Alterar' : 'Adicionar'}
              </Button>
              
              {formData.avatar_url && (
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
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {getDisplayName()}
              {profile?.affiliate_status === 'approved' && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Elite Verificado
                </Badge>
              )}
            </h2>
            <p className="text-slate-400">{user?.email}</p>
            {profile?.username && (
              <p className="text-sm text-slate-500">ID: {profile.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Informações Pessoais e Localização */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">Informações Pessoais</h3>
          <div>
            <Label htmlFor="first_name" className="text-slate-400">Nome *</Label>
            <Input id="first_name" value={formData.first_name} onChange={e => handleInputChange('first_name', e.target.value)} disabled={!isEditing} className="mt-1 bg-slate-800 border-slate-700 focus:border-orange-500" />
          </div>
          <div>
            <Label htmlFor="last_name" className="text-slate-400">Sobrenome</Label>
            <Input id="last_name" value={formData.last_name} onChange={e => handleInputChange('last_name', e.target.value)} disabled={!isEditing} className="mt-1 bg-slate-800 border-slate-700 focus:border-orange-500" />
          </div>
          <div>
            <Label htmlFor="username" className="text-slate-400">ID (Apelido) *</Label>
            <Input id="username" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} disabled={!isEditing} className="mt-1 bg-slate-800 border-slate-700 focus:border-orange-500" />
            <p className="text-xs text-slate-500 mt-1">Este será seu identificador único na plataforma. Use apenas letras e números, sem espaços.</p>
          </div>
          <div>
            <Label htmlFor="phone" className="text-slate-400">Telefone</Label>
            <Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} disabled={!isEditing} className="mt-1 bg-slate-800 border-slate-700 focus:border-orange-500" />
          </div>
           <div>
            <Label htmlFor="email" className="text-slate-400">Email</Label>
            <Input id="email" value={user?.email || ''} disabled className="mt-1 bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">Localização</h3>
          <div>
            <Label htmlFor="city" className="text-slate-400">Cidade</Label>
            <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} disabled={!isEditing} className="mt-1 bg-slate-800 border-slate-700 focus:border-orange-500" />
          </div>
          <div>
            <Label htmlFor="state" className="text-slate-400">Estado</Label>
            <Input id="state" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} disabled={!isEditing} className="mt-1 bg-slate-800 border-slate-700 focus:border-orange-500" />
          </div>
          <div>
            <Label htmlFor="country" className="text-slate-400">País</Label>
             <Select 
              value={formData.country} 
              onValueChange={value => handleInputChange('country', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 focus:border-orange-500">
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="Brasil">Brasil</SelectItem>
                <SelectItem value="Portugal">Portugal</SelectItem>
                <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">Bio</h3>
        <Textarea 
          value={formData.bio} 
          onChange={e => handleInputChange('bio', e.target.value)} 
          disabled={!isEditing} 
          placeholder="Conte um pouco sobre você..."
          className="bg-slate-800 border-slate-700 focus:border-orange-500 min-h-[100px]"
        />
      </div>

       {/* Redes Sociais */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">Redes Sociais (Opcional)</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-slate-400" />
            <Input placeholder="seu_usuario_instagram" value={formData.social_instagram} onChange={e => handleInputChange('social_instagram', e.target.value)} disabled={!isEditing} className="bg-slate-800 border-slate-700" />
          </div>
          <div className="flex items-center gap-3">
            <Youtube className="w-5 h-5 text-slate-400" />
            <Input placeholder="seu_canal_youtube" value={formData.social_youtube} onChange={e => handleInputChange('social_youtube', e.target.value)} disabled={!isEditing} className="bg-slate-800 border-slate-700" />
          </div>
          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-slate-400" />
            <Input placeholder="seu_perfil_linkedin" value={formData.social_linkedin} onChange={e => handleInputChange('social_linkedin', e.target.value)} disabled={!isEditing} className="bg-slate-800 border-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <Card className="bg-slate-800/60 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-xl text-white">Preferências de Notificação</CardTitle>
        <CardDescription className="text-slate-400">Escolha como você quer ser comunicado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700">
          <div>
            <Label htmlFor="email_notifications" className="font-semibold text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Notificações por E-mail
            </Label>
            <p className="text-sm text-slate-400 mt-1">Receba e-mails sobre atividades importantes da sua conta.</p>
          </div>
          <Switch
            id="email_notifications"
            checked={formData.email_notifications}
            onCheckedChange={value => handleInputChange('email_notifications', value)}
            disabled={!isEditing}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700">
          <div>
            <Label htmlFor="commission_alerts" className="font-semibold text-slate-200 flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-green-400" />
              Alertas de Comissão
            </Label>
            <p className="text-sm text-slate-400 mt-1">Seja notificado imediatamente quando uma nova comissão for registrada.</p>
          </div>
          <Switch
            id="commission_alerts"
            checked={formData.commission_alerts}
            onCheckedChange={value => handleInputChange('commission_alerts', value)}
            disabled={!isEditing}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700">
          <div>
            <Label htmlFor="marketing_emails" className="font-semibold text-slate-200 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              E-mails de Marketing
            </Label>
            <p className="text-sm text-slate-400 mt-1">Receba dicas, novidades sobre produtos e ofertas especiais.</p>
          </div>
          <Switch
            id="marketing_emails"
            checked={formData.marketing_emails}
            onCheckedChange={value => handleInputChange('marketing_emails', value)}
            disabled={!isEditing}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <Card className="bg-slate-800/60 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-xl text-white">Segurança da Conta</CardTitle>
        <CardDescription className="text-slate-400">Gerencie a segurança da sua conta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2"><Key className="w-4 h-4" />Senha</h3>
          <p className="text-sm text-slate-400 mt-1 mb-3">
            É recomendado usar uma senha forte que você não usa em nenhum outro lugar.
          </p>
          <Button variant="outline" className="border-slate-600/80 hover:bg-slate-700/50">
            Alterar Senha
          </Button>
        </div>
        
        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
           <h3 className="font-semibold text-slate-200">Sessões Ativas</h3>
          <p className="text-sm text-slate-400 mt-1 mb-3">
            Isso desconectará você de todos os outros dispositivos.
          </p>
          <Button variant="destructive_outline">
            Desconectar de outros dispositivos
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const { isAdmin } = useAuth();

  const getHeaderActions = () => (
    <>
      {isEditing ? (
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="border-slate-600/80 hover:bg-slate-700/50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      ) : (
        <Button 
          onClick={() => setIsEditing(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
      )}
    </>
  );

  return (
    <PageLayout
      headerContent={<PageHeader title="Configurações" description="Gerencie suas informações e preferências." customActions={getHeaderActions()} />}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/60 border border-slate-700/50 p-1 h-auto">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Pessoal
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Segurança
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-0">
          {renderPersonalTab()}
        </TabsContent>
        <TabsContent value="notifications" className="mt-0">
          {renderNotificationsTab()}
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          {renderSecurityTab()}
        </TabsContent>
      </Tabs>

      {/* Modal de Upload de Avatar */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Alterar Foto de Perfil</DialogTitle>
            <DialogDescription>
              Faça o upload de uma nova imagem para o seu perfil.
            </DialogDescription>
          </DialogHeader>
          <ImageUpload 
            onUploadComplete={(url) => {
              handleInputChange('avatar_url', url);
              setShowAvatarModal(false);
              toast({ title: 'Upload concluído!', description: 'Sua nova foto de perfil está pronta. Salve as alterações para aplicá-la.' });
            }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAvatarModal(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default SettingsPage; 