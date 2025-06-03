import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Edit, Sparkles, Phone, AtSign, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    affiliate_code: profile?.affiliate_code || '',
    avatar_url: profile?.avatar_url || ''
  });

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const handleInputChange = (field: string, value: string) => {
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
        avatar_url: formData.avatar_url
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
      avatar_url: profile?.avatar_url || ''
    });
    setIsEditing(false);
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
              Salvar
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              {isEditing ? (
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
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-slate-900" />
                  )}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">{getDisplayName()}</h2>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-400">Nome *</Label>
                {isEditing ? (
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Seu primeiro nome"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.first_name || 'Não informado'}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-400">Sobrenome *</Label>
                {isEditing ? (
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Seu sobrenome"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.last_name || 'Não informado'}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-400">Email</Label>
                <p className="text-white">{user?.email}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-400">
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
                  <p className="text-white">{profile?.phone || 'Não informado'}</p>
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-400">
                  <AtSign className="inline h-4 w-4 mr-1" />
                  Nome de Perfil
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.affiliate_code}
                    onChange={(e) => handleInputChange('affiliate_code', e.target.value.toLowerCase())}
                    placeholder="seunome123"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.affiliate_code || 'Não definido'}</p>
                )}
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
              <Badge className={`mb-2 ${
                profile?.affiliate_status === 'approved' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              }`}>
                {profile?.affiliate_status === 'approved' ? 'Ativo' : 'Pendente'}
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
                <span className="text-slate-400">Perfil Completo</span>
                <span className="text-white">
                  {profile?.onboarding_completed_at ? (
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Sim</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Pendente</Badge>
                  )}
                </span>
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