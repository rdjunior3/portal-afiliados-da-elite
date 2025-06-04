import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Sparkles, 
  Phone, 
  AtSign, 
  Save, 
  X, 
  Shield,
  CreditCard,
  Bell,
  Globe,
  Key,
  UserCheck,
  MapPin,
  Building,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';

// Componente de ícone troféu pequeno
const TrophyIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill={color} viewBox="0 0 24 24">
    {/* Base/Pedestal */}
    <rect x="7" y="19" width="10" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
    <rect x="8" y="18.5" width="8" height="1" fill="rgba(0,0,0,0.2)"/>
    
    {/* Haste */}
    <rect x="10.5" y="16" width="3" height="3" fill={color}/>
    
    {/* Copa Principal */}
    <path d="M6 4C6 3.45 6.45 3 7 3H17C17.55 3 18 3.45 18 4V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9V4Z" fill={color}/>
    
    {/* Alças Laterais */}
    <ellipse cx="5" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="19" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="5" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    <ellipse cx="19" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    
    {/* Número 1 Central */}
    <text x="12" y="11" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="rgba(255,255,255,0.95)">1</text>
    
    {/* Estrela decorativa central */}
    <polygon points="12,6 12.1,6.4 12.5,6.4 12.2,6.7 12.3,7.1 12,6.9 11.7,7.1 11.8,6.7 11.5,6.4 11.9,6.4" fill="rgba(255,255,255,0.9)" />
  </svg>
);

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'payment' | 'preferences' | 'security'>('personal');
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    affiliate_code: profile?.affiliate_code || '',
    avatar_url: profile?.avatar_url || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || 'Brasil',
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

  const tabs = [
    { id: 'personal', label: 'Pessoais', icon: User },
    { id: 'payment', label: 'Pagamento', icon: CreditCard },
    { id: 'preferences', label: 'Preferências', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e sobrenome são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
      
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: fullName,
        phone: formData.phone.trim(),
        affiliate_code: formData.affiliate_code.toLowerCase().trim(),
        avatar_url: formData.avatar_url,
        bio: formData.bio.trim(),
        website: formData.website.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country,
        pix_key: formData.pix_key.trim(),
        bank_name: formData.bank_name.trim(),
        bank_account: formData.bank_account.trim(),
        bank_agency: formData.bank_agency.trim(),
        email_notifications: formData.email_notifications,
        sms_notifications: formData.sms_notifications,
        marketing_emails: formData.marketing_emails,
        commission_alerts: formData.commission_alerts,
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        throw error;
      }

      setIsEditing(false);
      toast({
        title: "Perfil atualizado! ✅",
        description: "Suas informações foram salvas com sucesso.",
      });
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      affiliate_code: profile?.affiliate_code || '',
      avatar_url: profile?.avatar_url || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
      city: profile?.city || '',
      state: profile?.state || '',
      country: profile?.country || 'Brasil',
      pix_key: profile?.pix_key || '',
      bank_name: profile?.bank_name || '',
      bank_account: profile?.bank_account || '',
      bank_agency: profile?.bank_agency || '',
      email_notifications: profile?.email_notifications ?? true,
      sms_notifications: profile?.sms_notifications ?? false,
      marketing_emails: profile?.marketing_emails ?? true,
      commission_alerts: profile?.commission_alerts ?? true,
    });
    setIsEditing(false);
  };

  const renderPersonalTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {isEditing ? (
          <div className="flex flex-col items-center">
            <ImageUpload
              value={formData.avatar_url}
              onChange={(url) => handleInputChange('avatar_url', url)}
              bucket="avatars"
              folder="profiles"
              label=""
              placeholder="Alterar foto"
              maxWidth={300}
              maxHeight={300}
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <TrophyIcon className="w-10 h-10" color="#1e293b" />
            )}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{getDisplayName()}</h2>
          <p className="text-slate-400">{user?.email}</p>
          {profile?.affiliate_status === 'approved' && (
            <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Afiliado Elite Verificado
            </Badge>
          )}
        </div>
      </div>

      {/* Form Fields */}
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
            <Label className="text-slate-200">Sobrenome *</Label>
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
              <AtSign className="inline h-4 w-4 mr-1" />
              Nome de Usuário
            </Label>
            {isEditing ? (
              <Input
                value={formData.affiliate_code}
                onChange={(e) => handleInputChange('affiliate_code', e.target.value.toLowerCase())}
                placeholder="seunome123"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-white p-3 bg-slate-800/30 rounded-lg">{profile?.affiliate_code || 'Não definido'}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
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
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div>
            <Label className="text-slate-200 font-medium">Notificações por Email</Label>
            <p className="text-slate-400 text-sm">Receba atualizações importantes por email</p>
          </div>
          <Switch
            checked={formData.email_notifications}
            onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
            disabled={!isEditing}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div>
            <Label className="text-slate-200 font-medium">Notificações por SMS</Label>
            <p className="text-slate-400 text-sm">Receba alertas urgentes por SMS</p>
          </div>
          <Switch
            checked={formData.sms_notifications}
            onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
            disabled={!isEditing}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div>
            <Label className="text-slate-200 font-medium">Emails de Marketing</Label>
            <p className="text-slate-400 text-sm">Receba dicas e novidades sobre produtos</p>
          </div>
          <Switch
            checked={formData.marketing_emails}
            onCheckedChange={(checked) => handleInputChange('marketing_emails', checked)}
            disabled={!isEditing}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div>
            <Label className="text-slate-200 font-medium">Alertas de Comissão</Label>
            <p className="text-slate-400 text-sm">Seja notificado quando ganhar comissões</p>
          </div>
          <Switch
            checked={formData.commission_alerts}
            onCheckedChange={(checked) => handleInputChange('commission_alerts', checked)}
            disabled={!isEditing}
          />
        </div>
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
          className="w-full justify-start border-slate-600 text-slate-300 h-auto p-4"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Autenticação em Dois Fatores</p>
                <p className="text-sm text-slate-400">Adicione uma camada extra de segurança</p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              Recomendado
            </Badge>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrophyIcon className="w-8 h-8" color="#f97316" />
            Perfil Elite
          </h1>
          <p className="text-slate-400">
            Gerencie suas informações pessoais e configurações da conta
          </p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Tabs */}
        <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'personal' && renderPersonalTab()}
            {activeTab === 'payment' && renderPaymentTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Status Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-400" />
            Status do Afiliado Elite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrophyIcon className="w-6 h-6" color="#f97316" />
              </div>
              <Badge className={`mb-2 ${
                profile?.affiliate_status === 'approved' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              }`}>
                {profile?.affiliate_status === 'approved' ? 'Elite Ativo' : 'Pendente'}
              </Badge>
              <p className="text-sm text-slate-400">
                ID: {profile?.affiliate_id || 'Aguardando'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-white font-semibold">Data de Cadastro</p>
              <p className="text-sm text-slate-400">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-white font-semibold">Perfil Completo</p>
              <p className="text-sm text-slate-400">
                {profile?.onboarding_completed_at ? (
                  <Badge className="bg-green-500/20 text-green-400 text-xs">Sim</Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Pendente</Badge>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 