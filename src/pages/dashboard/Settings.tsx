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
  Phone, Mail, MapPin, CreditCard, DollarSign, Building, Key, 
  Sparkles, Globe, Instagram, Youtube, Twitter, Linkedin 
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
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || 'Brasil',
    
    // Redes sociais
    social_instagram: profile?.social_instagram || '',
    social_youtube: profile?.social_youtube || '',
    social_linkedin: profile?.social_linkedin || '',
    
    // Configurações de pagamento
    pix_key: profile?.pix_key || '',
    bank_name: profile?.bank_name || '',
    bank_account: profile?.bank_account || '',
    bank_agency: profile?.bank_agency || '',
    
    // Preferências de notificação
    email_notifications: profile?.email_notifications ?? true,
    sms_notifications: profile?.sms_notifications ?? false,
    marketing_emails: profile?.marketing_emails ?? true,
    commission_alerts: profile?.commission_alerts ?? true,
  });

  // Atualizar formData quando profile mudar
  useEffect(() => {
    if (profile) {
      const newFormData = {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        website: profile.website || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || 'Brasil',
        social_instagram: profile.social_instagram || '',
        social_youtube: profile.social_youtube || '',
        social_linkedin: profile.social_linkedin || '',
        pix_key: profile.pix_key || '',
        bank_name: profile.bank_name || '',
        bank_account: profile.bank_account || '',
        bank_agency: profile.bank_agency || '',
        email_notifications: profile.email_notifications ?? true,
        sms_notifications: profile.sms_notifications ?? false,
        marketing_emails: profile.marketing_emails ?? true,
        commission_alerts: profile.commission_alerts ?? true,
      };
      setFormData(newFormData);
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
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
      
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: fullName,
        phone: formData.phone.trim(),
        avatar_url: formData.avatar_url,
        bio: formData.bio.trim(),
        website: formData.website.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country,
        social_instagram: formData.social_instagram.trim(),
        social_youtube: formData.social_youtube.trim(),
        social_linkedin: formData.social_linkedin.trim(),
        pix_key: formData.pix_key.trim(),
        bank_name: formData.bank_name.trim(),
        bank_account: formData.bank_account.trim(),
        bank_agency: formData.bank_agency.trim(),
        email_notifications: formData.email_notifications,
        sms_notifications: formData.sms_notifications,
        marketing_emails: formData.marketing_emails,
        commission_alerts: formData.commission_alerts,
        // Marcar que o perfil foi completado
        onboarding_completed_at: new Date().toISOString()
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        throw error;
      }

      toast({
        title: "Configurações salvas! ✅",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsEditing(false);
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
            {profile?.affiliate_id && (
              <p className="text-sm text-slate-500">ID: {profile.affiliate_id}</p>
            )}
          </div>
        </div>
      </div>

      {/* Informações Pessoais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Nome *</Label>
            {isEditing ? (
              <Input
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Seu primeiro nome"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.first_name || 'Não informado'}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-200">Sobrenome</Label>
            {isEditing ? (
              <Input
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Seu sobrenome"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.last_name || 'Não informado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">
              <Phone className="inline h-4 w-4 mr-1" />
              Telefone
            </Label>
            {isEditing ? (
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.phone || 'Não informado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">
              <Globe className="inline h-4 w-4 mr-1" />
              Website
            </Label>
            {isEditing ? (
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://seusite.com"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.website || 'Não informado'}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">
                <MapPin className="inline h-4 w-4 mr-1" />
                Cidade
              </Label>
              {isEditing ? (
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="São Paulo"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.city || 'Não informado'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Estado</Label>
              {isEditing ? (
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.state || 'Não informado'}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">País</Label>
            {isEditing ? (
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="Brasil">Brasil</SelectItem>
                  <SelectItem value="Portugal">Portugal</SelectItem>
                  <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.country || 'Não informado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Email</Label>
            <p className="text-slate-400 p-3 bg-slate-800/30 rounded-lg">{user?.email}</p>
            <p className="text-xs text-slate-500">O email não pode ser alterado</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-slate-200">Bio</Label>
        {isEditing ? (
          <Textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Conte um pouco sobre você..."
            className="bg-slate-700/50 border-slate-600 text-white"
            rows={3}
          />
        ) : (
          <p className="text-white p-3 bg-slate-800/30 rounded-lg min-h-[80px]">
            {profile?.bio || 'Nenhuma biografia adicionada ainda.'}
          </p>
        )}
      </div>

      {/* Redes Sociais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Redes Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-200">
              <Instagram className="inline h-4 w-4 mr-1" />
              Instagram
            </Label>
            {isEditing ? (
              <Input
                value={formData.social_instagram}
                onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                placeholder="@seuinstagram"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.social_instagram || 'Não informado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">
              <Youtube className="inline h-4 w-4 mr-1" />
              YouTube
            </Label>
            {isEditing ? (
              <Input
                value={formData.social_youtube}
                onChange={(e) => handleInputChange('social_youtube', e.target.value)}
                placeholder="youtube.com/c/seucanal"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.social_youtube || 'Não informado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">
              <Linkedin className="inline h-4 w-4 mr-1" />
              LinkedIn
            </Label>
            {isEditing ? (
              <Input
                value={formData.social_linkedin}
                onChange={(e) => handleInputChange('social_linkedin', e.target.value)}
                placeholder="linkedin.com/in/seuperfil"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.social_linkedin || 'Não informado'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-orange-400" />
          <h3 className="text-orange-200 font-semibold">Configurações de Pagamento</h3>
        </div>
        <p className="text-orange-100 text-sm">
          Configure seus dados bancários para receber suas comissões. Todas as informações são criptografadas e seguras.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Chave PIX</Label>
            {isEditing ? (
              <Input
                value={formData.pix_key}
                onChange={(e) => handleInputChange('pix_key', e.target.value)}
                placeholder="email@exemplo.com ou CPF"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.pix_key || 'Não informado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">
              <Building className="inline h-4 w-4 mr-1" />
              Banco
            </Label>
            {isEditing ? (
              <Input
                value={formData.bank_name}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                placeholder="Nome do banco"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.bank_name || 'Não informado'}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Conta</Label>
            {isEditing ? (
              <Input
                value={formData.bank_account}
                onChange={(e) => handleInputChange('bank_account', e.target.value)}
                placeholder="12345-6"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.bank_account || 'Não informado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Agência</Label>
            {isEditing ? (
              <Input
                value={formData.bank_agency}
                onChange={(e) => handleInputChange('bank_agency', e.target.value)}
                placeholder="1234"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.bank_agency || 'Não informado'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-5 w-5 text-blue-400" />
          <h3 className="text-blue-200 font-semibold">Preferências de Notificação</h3>
        </div>
        <p className="text-blue-100 text-sm">
          Escolha como e quando você gostaria de receber notificações sobre suas atividades como afiliado.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            key: 'email_notifications',
            title: 'Notificações por Email',
            description: 'Receba atualizações importantes por email',
            value: formData.email_notifications
          },
          {
            key: 'sms_notifications',
            title: 'Notificações por SMS',
            description: 'Receba alertas urgentes por SMS',
            value: formData.sms_notifications
          },
          {
            key: 'marketing_emails',
            title: 'Emails de Marketing',
            description: 'Receba dicas e novidades sobre produtos',
            value: formData.marketing_emails
          },
          {
            key: 'commission_alerts',
            title: 'Alertas de Comissão',
            description: 'Seja notificado quando ganhar comissões',
            value: formData.commission_alerts
          }
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg backdrop-blur-sm">
            <div>
              <p className="text-white font-medium">{setting.title}</p>
              <p className="text-sm text-slate-400 mt-1">{setting.description}</p>
            </div>
            <Switch 
              checked={setting.value}
              onCheckedChange={(checked) => handleInputChange(setting.key, checked)}
              disabled={!isEditing}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-red-400" />
          <h3 className="text-red-200 font-semibold">Configurações de Segurança</h3>
        </div>
        <p className="text-red-100 text-sm">
          Mantenha sua conta segura com essas configurações de segurança.
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full justify-start border-slate-600 text-slate-300 h-auto p-4"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Alterar Senha</p>
                <p className="text-sm text-slate-400">Última alteração: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <span className="text-orange-400">→</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start border-slate-600 text-slate-300 h-auto p-4"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Alterar Email</p>
                <p className="text-sm text-slate-400">Email atual: {user?.email}</p>
              </div>
            </div>
            <span className="text-orange-400">→</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start border-yellow-600/50 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500 h-auto p-4"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Configurar 2FA</p>
                <p className="text-sm text-slate-400">Adicione uma camada extra de segurança</p>
              </div>
            </div>
            <span className="text-yellow-400">→</span>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <PageLayout
      fullWidth={true}
      headerContent={
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Configurações da Conta"
            description="Gerencie seu perfil, preferências e configurações de segurança"
            icon="⚙️"
          />
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header com botões de ação */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Configurações Completas</h1>
            <p className="text-slate-400">
              Configure seu perfil e preferências para uma experiência personalizada
            </p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Configurações
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button 
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Tabs de configuração */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <TabsContent value="personal" className="mt-0">
                  {renderPersonalTab()}
                </TabsContent>
                <TabsContent value="payment" className="mt-0">
                  {renderPaymentTab()}
                </TabsContent>
                <TabsContent value="notifications" className="mt-0">
                  {renderNotificationsTab()}
                </TabsContent>
                <TabsContent value="security" className="mt-0">
                  {renderSecurityTab()}
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </Tabs>

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
                value={formData.avatar_url}
                onChange={(url) => {
                  handleInputChange('avatar_url', url);
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
                    description: "Não esqueça de salvar as alterações.",
                  });
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Aplicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default SettingsPage; 