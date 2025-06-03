import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Phone, AtSign, CheckCircle } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

const CompleteProfile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    profile_username: profile?.affiliate_code || '',
    avatar_url: profile?.avatar_url || ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateUsername = () => {
    const firstName = formData.first_name.toLowerCase().replace(/\s+/g, '');
    const lastName = formData.last_name.toLowerCase().replace(/\s+/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    return `${firstName}${lastName}${randomSuffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Gerar username se não foi preenchido
      const profileUsername = formData.profile_username.trim() || generateUsername();
      
      // Calcular full_name
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;

      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: fullName,
        phone: formData.phone.trim(),
        affiliate_code: profileUsername.toLowerCase(),
        avatar_url: formData.avatar_url,
        affiliate_status: 'approved', // Alterar status para aprovado
        onboarding_completed_at: new Date().toISOString()
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil Completo! 🎉",
        description: "Seu perfil foi atualizado com sucesso. Bem-vindo à Elite!",
      });

      // Redirecionar para o dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Erro ao completar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível completar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Complete seu Perfil Elite
          </CardTitle>
          <CardDescription className="text-slate-300">
            Preencha suas informações para ativar sua conta e acessar todos os recursos exclusivos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de Avatar */}
            <div className="flex justify-center">
              <ImageUpload
                value={formData.avatar_url}
                onChange={(url) => handleInputChange('avatar_url', url)}
                bucket="avatars"
                folder="profiles"
                label="Foto de Perfil (Opcional)"
                placeholder="Adicione sua foto"
                maxWidth={300}
                maxHeight={300}
                className="text-center"
              />
            </div>

            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-200 font-medium">
                  Nome *
                </Label>
                <Input
                  id="firstName"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Seu primeiro nome"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-200 font-medium">
                  Sobrenome *
                </Label>
                <Input
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Seu sobrenome"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-200 font-medium">
                <Phone className="inline h-4 w-4 mr-2" />
                Número para Contato *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>

            {/* Nome de Perfil/Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200 font-medium">
                <AtSign className="inline h-4 w-4 mr-2" />
                Nome de Perfil (Opcional)
              </Label>
              <Input
                id="username"
                value={formData.profile_username}
                onChange={(e) => handleInputChange('profile_username', e.target.value.toLowerCase())}
                placeholder="seunome123"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                Será gerado automaticamente se não preenchido
              </p>
            </div>

            {/* Informações sobre ativação */}
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-orange-100 font-medium mb-2">
                    Após completar seu perfil você terá acesso a:
                  </h4>
                  <ul className="text-sm text-orange-200 space-y-1">
                    <li>• Status de Afiliado Ativo</li>
                    <li>• Acesso ao Chat Elite</li>
                    <li>• Criação de links de afiliado</li>
                    <li>• Relatórios de performance</li>
                    <li>• Materiais exclusivos para promoção</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botão de submissão */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 h-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Completando Perfil...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Completar Perfil Elite
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile; 