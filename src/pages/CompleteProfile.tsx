import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Phone, AtSign, CheckCircle, X, ArrowRight, AlertTriangle } from 'lucide-react';
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
  const [errors, setErrors] = useState<string[]>([]);

  // Atualizar formData quando profile mudar
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        profile_username: profile.affiliate_code || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpar erros quando usuário começa a digitar
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const generateUsername = () => {
    const firstName = formData.first_name.toLowerCase().replace(/\s+/g, '');
    const lastName = formData.last_name.toLowerCase().replace(/\s+/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    return `${firstName}${lastName}${randomSuffix}`;
  };

  const validateForm = () => {
    const validationErrors = [];
    
    if (!formData.first_name.trim()) {
      validationErrors.push('Nome é obrigatório');
    }
    
    if (!formData.last_name.trim()) {
      validationErrors.push('Sobrenome é obrigatório');
    }
    
    if (!formData.phone.trim()) {
      validationErrors.push('Telefone é obrigatório');
    }
    
    // Validar formato do telefone (básico)
    const phoneRegex = /^[\d\s\(\)\-\+]{10,}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      validationErrors.push('Formato de telefone inválido (use apenas números, espaços, parênteses ou hífens)');
    }
    
    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando processo de completar perfil...');
    
    // Limpar erros anteriores
    setErrors([]);
    
    // Validar formulário
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros abaixo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Dados do formulário:', formData);
      
      // Verificar se o usuário existe
      if (!user?.id) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }
      
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
        avatar_url: formData.avatar_url || null,
        affiliate_status: 'approved', // Alterar status para aprovado
        onboarding_completed_at: new Date().toISOString()
      };

      console.log('📤 Enviando dados para atualização:', updateData);

      const result = await updateProfile(updateData);

      console.log('📥 Resultado da atualização:', result);

      if (result.error) {
        console.error('❌ Erro na atualização:', result.error);
        throw result.error;
      }

      console.log('✅ Perfil atualizado com sucesso!');

      // Remover flag de skip do sessionStorage
      sessionStorage.removeItem('profile_skip_allowed');

      toast({
        title: "Perfil Completo! 🎉",
        description: "Seu perfil foi atualizado com sucesso. Bem-vindo à Elite!",
      });

      // Aguardar um pouco antes de redirecionar para garantir que o estado foi atualizado
      setTimeout(() => {
        console.log('🔄 Redirecionando para dashboard...');
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('💥 Erro ao completar perfil:', error);
      
      let errorMessage = "Não foi possível completar seu perfil. Tente novamente.";
      
      // Mensagens de erro mais específicas
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        errorMessage = "Já existe um usuário com essas informações. Tente usar dados diferentes.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message?.includes('invalid') || error.message?.includes('validation')) {
        errorMessage = "Dados inválidos. Verifique as informações e tente novamente.";
      } else if (error.code === 'PGRST301' || error.message?.includes('permission')) {
        errorMessage = "Erro de permissão. Tente fazer login novamente.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "A operação demorou muito. Tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors([errorMessage]);
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para pular e ir direto ao dashboard com limitações
  const handleSkipToLimitedDashboard = () => {
    // Definir flag para permitir acesso limitado
    sessionStorage.setItem('profile_skip_allowed', 'true');
    
    toast({
      title: "Acesso Limitado Ativado",
      description: "Você pode completar seu perfil depois para ter acesso completo às funcionalidades.",
      variant: "default",
    });
    
    navigate('/dashboard');
  };

  // Verificar se usuário já tem perfil completo
  useEffect(() => {
    if (profile && profile.onboarding_completed_at) {
      console.log('👤 Usuário já tem perfil completo, redirecionando...');
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-xl relative">
        {/* Botão de Fechar */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSkipToLimitedDashboard}
          className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-700/50 z-10"
          title="Pular e acessar dashboard com funcionalidades limitadas"
        >
          <X className="h-4 w-4" />
        </Button>

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
          {/* Exibir erros se houver */}
          {errors.length > 0 && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-100 font-medium mb-2">
                    Erro{errors.length > 1 ? 's' : ''} encontrado{errors.length > 1 ? 's' : ''}:
                  </h4>
                  <ul className="text-sm text-red-200 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload de Avatar com Recorte */}
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
                enableCrop={true}
                cropAspect={1} // Aspecto quadrado para perfil
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
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                  required
                  disabled={loading}
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
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                  required
                  disabled={loading}
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
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                required
                disabled={loading}
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
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                disabled={loading}
              />
              <p className="text-xs text-slate-400">
                Será gerado automaticamente se não preenchido
              </p>
            </div>

            {/* Informações sobre ativação - TEXTO ATUALIZADO */}
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-orange-100 font-medium mb-2">
                    Após completar seu perfil você terá acesso a:
                  </h4>
                  <ul className="text-sm text-orange-200 space-y-1">
                    <li>• Status de Afiliado Ativo</li>
                    <li>• Acesso ao Chat da Comunidade Elite</li>
                    <li>• Acesso a produtos para afiliação</li>
                    <li>• Materiais exclusivos para divulgação</li>
                    <li>• Aulas e estratégias exclusivas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Informação sobre acesso limitado */}
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <ArrowRight className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-100 font-medium mb-1">
                    Quer acessar agora mesmo?
                  </h4>
                  <p className="text-sm text-blue-200">
                    Você pode fechar este quadro e acessar o dashboard com funcionalidades básicas. 
                    Complete seu perfil depois para ter acesso total.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Botão de pular */}
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipToLimitedDashboard}
                disabled={loading}
                className="border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-300 h-auto py-3"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                Acessar Dashboard Agora
              </Button>

              {/* Botão de submissão */}
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 h-auto disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Completando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Completar Perfil Elite
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile; 