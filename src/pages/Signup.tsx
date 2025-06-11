import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check } from 'lucide-react';

// Componente de ícone troféu para logomarca
const TrophyIcon = ({ className = "w-7 h-7", color = "currentColor" }) => (
  <svg className={className} fill={color} viewBox="0 0 24 24">
    {/* Base/Pedestal escuro */}
    <rect x="7" y="19" width="10" height="2.5" rx="0.5" fill="rgba(0,0,0,0.7)"/>
    <rect x="8" y="18.5" width="8" height="1" fill="rgba(0,0,0,0.5)"/>
    
    {/* Haste */}
    <rect x="10.5" y="16" width="3" height="3" fill={color}/>
    
    {/* Copa Principal - Formato mais largo */}
    <path d="M6 4C6 3.45 6.45 3 7 3H17C17.55 3 18 3.45 18 4V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9V4Z" fill={color}/>
    
    {/* Detalhes da Copa - linhas decorativas */}
    <rect x="7" y="4" width="10" height="0.5" fill="rgba(255,255,255,0.3)"/>
    <rect x="7" y="6" width="10" height="0.3" fill="rgba(255,255,255,0.2)"/>
    
    {/* Alças Laterais mais visíveis */}
    <ellipse cx="5" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="19" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="5" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    <ellipse cx="19" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    
    {/* Número 1 Central - mais proeminente */}
    <text x="12" y="11" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="rgba(255,255,255,0.95)">1</text>
    
    {/* Estrelas ao redor do número 1 */}
    <g fill="rgba(255,255,255,0.9)">
      <polygon points="9,8 9.2,8.6 9.8,8.6 9.3,9 9.5,9.6 9,9.2 8.5,9.6 8.7,9 8.2,8.6 8.8,8.6" />
      <polygon points="15,8 15.2,8.6 15.8,8.6 15.3,9 15.5,9.6 15,9.2 14.5,9.6 14.7,9 14.2,8.6 14.8,8.6" />
      <polygon points="10.5,6 10.6,6.4 11,6.4 10.7,6.7 10.8,7.1 10.5,6.9 10.2,7.1 10.3,6.7 10,6.4 10.4,6.4" />
      <polygon points="13.5,6 13.6,6.4 14,6.4 13.7,6.7 13.8,7.1 13.5,6.9 13.2,7.1 13.3,6.7 13,6.4 13.4,6.4" />
      <polygon points="12,5 12.1,5.4 12.5,5.4 12.2,5.7 12.3,6.1 12,5.9 11.7,6.1 11.8,5.7 11.5,5.4 11.9,5.4" />
    </g>
  </svg>
);

// Componente de ícone original do Google
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no cadastro',
          description: error.message
        });
      } else {
        toast({
          variant: 'success',
          title: 'Cadastro realizado!',
          description: 'Bem-vindo à sua área de membros elite.'
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o cadastro.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Dashboard completo para acompanhar performance',
    'Acesso a videoaulas e materiais exclusivos',
    'Comunidade ativa de afiliados elite',
    'Suporte prioritário 24/7',
    'Ferramentas avançadas de marketing'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.02)_0%,transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Benefits */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Junte-se à <span className="text-orange-400">Elite</span> dos Afiliados
            </h2>
            <p className="text-slate-300 text-lg">
              Acesse uma plataforma completa para maximizar seus resultados como afiliado.
            </p>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-slate-900" />
                </div>
                <span className="text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-400">457+</div>
                <div className="text-xs text-slate-400">Afiliados Ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">89%</div>
                <div className="text-xs text-slate-400">Taxa de Sucesso</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">24/7</div>
                <div className="text-xs text-slate-400">Suporte</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full">
          {/* Back to Home */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
          </div>

          {/* Signup Card */}
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <TrophyIcon className="w-7 h-7" color="#1e293b" />
                </div>
                <span className="text-xl font-bold text-orange-400 tracking-tight">
                  AFILIADOS DA ELITE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
              <p className="text-slate-400">Comece sua jornada como afiliado elite</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-200">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength() 
                              ? passwordStrength() <= 1 ? 'bg-red-400' 
                                : passwordStrength() <= 2 ? 'bg-yellow-400'
                                : passwordStrength() <= 3 ? 'bg-blue-400'
                                : 'bg-orange-400'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Força da senha: {
                        passwordStrength() <= 1 ? 'Fraca' :
                        passwordStrength() <= 2 ? 'Média' :
                        passwordStrength() <= 3 ? 'Boa' : 'Forte'
                      }
                    </p>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 text-slate-100 font-semibold transition-all duration-300 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  'Criar Conta Elite'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">ou continue com</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            </div>

            {/* Google Signup */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500"
            >
              <div className="flex items-center gap-3">
                <GoogleIcon className="w-5 h-5" />
                <span>Continuar com Google</span>
              </div>
            </Button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <span className="text-slate-400 text-sm">
                Já tem uma conta? 
              </span>{' '}
              <Link
                to="/login"
                className="text-orange-400 hover:text-orange-300 font-medium underline transition-colors"
              >
                Fazer login
              </Link>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center gap-6 mt-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>100% Gratuito</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>Sem Compromisso</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>Acesso Imediato</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 