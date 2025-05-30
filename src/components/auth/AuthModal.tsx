import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, TrendingUp, Users, DollarSign, Shield, Zap, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

interface ValidationState {
  email: string;
  password: string;
  fullName: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationState>({
    email: '',
    password: '',
    fullName: ''
  });
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Validation helpers
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email é obrigatório';
    if (!emailRegex.test(email)) return 'Email inválido';
    return '';
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Mínimo 6 caracteres';
    if (mode === 'signup' && !/(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)/.test(password)) {
      return 'Use letras maiúsculas e minúsculas ou números';
    }
    return '';
  }, [mode]);

  const validateFullName = useCallback((name: string) => {
    if (mode === 'signup') {
      if (!name.trim()) return 'Nome é obrigatório';
      if (name.trim().length < 2) return 'Nome muito curto';
    }
    return '';
  }, [mode]);

  // Real-time validation
  useEffect(() => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      fullName: validateFullName(formData.fullName)
    };
    setErrors(newErrors);
  }, [formData, validateEmail, validatePassword, validateFullName]);

  // Form validation state
  const isFormValid = useMemo(() => {
    return !Object.values(errors).some(error => error !== '') && 
           formData.email && 
           formData.password && 
           (mode === 'login' || formData.fullName);
  }, [errors, formData, mode]);

  // Password strength
  const passwordStrength = useMemo(() => {
    const { password } = formData;
    if (!password || mode === 'login') return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 4);
  }, [formData.password, mode]);

  const handleInputChange = useCallback((field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);

    try {
      const { email, password, fullName } = formData;
      
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (!error) {
          onClose();
          resetForm();
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (!error) {
          onClose();
          resetForm();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ email: '', password: '', fullName: '' });
    setErrors({ email: '', password: '', fullName: '' });
    setShowPassword(false);
  }, []);

  const switchMode = useCallback(() => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    resetForm();
  }, [resetForm]);

  // Animation variants
  const benefits = [
    { icon: TrendingUp, label: 'Dashboard', color: 'text-emerald-400' },
    { icon: DollarSign, label: 'Comissões', color: 'text-green-400' },
    { icon: Users, label: 'Comunidade', color: 'text-blue-400' }
  ];

  const trustIndicators = [
    { icon: Shield, label: '100% Seguro' },
    { icon: Zap, label: 'Acesso Imediato' },
    { icon: Check, label: 'Gratuito' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white shadow-2xl">
        <div className="relative overflow-hidden rounded-lg">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-blue-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />
          
          <div className="relative p-5 space-y-4">
          {/* Close button */}
          <button 
            onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800/50"
          >
            <div className="w-4 h-4 relative">
                <div className="absolute inset-0 w-4 h-0.5 bg-current rotate-45 top-1/2 -translate-y-1/2" />
                <div className="absolute inset-0 w-4 h-0.5 bg-current -rotate-45 top-1/2 -translate-y-1/2" />
            </div>
          </button>

          {/* Header */}
            <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-slate-900" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  AFILIADOS DA ELITE
                </span>
            </div>
            
              <div className="space-y-1">
                <h2 className="text-xl font-bold">
                  {mode === 'login' ? 'Acesse sua área!' : 'Entre para a Elite!'}
              </h2>
              <p className="text-slate-300 text-sm">
                {mode === 'login' 
                    ? 'Acesse sua área de membro e continue gerenciando suas comissões' 
                    : 'Junte-se à nossa comunidade exclusiva de afiliados de alto desempenho'
                }
              </p>
            </div>
          </div>

            {/* Mode toggle */}
            <div className="relative p-1 bg-slate-800/50 rounded-lg backdrop-blur-sm">
              <div 
                className={cn(
                  "absolute top-1 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-md transition-all duration-300 ease-out",
                  mode === 'login' ? 'left-1 w-[calc(50%-4px)]' : 'right-1 w-[calc(50%-4px)]'
                )}
              />
              <div className="relative flex">
            <button 
              onClick={() => setMode('login')}
                  className={cn(
                    "flex-1 py-2 px-4 text-sm font-medium transition-colors duration-300 rounded-md",
                    mode === 'login' ? 'text-slate-900' : 'text-slate-300 hover:text-white'
                  )}
            >
              Login
            </button>
            <button 
              onClick={() => setMode('signup')}
                  className={cn(
                    "flex-1 py-2 px-4 text-sm font-medium transition-colors duration-300 rounded-md",
                    mode === 'signup' ? 'text-slate-900' : 'text-slate-300 hover:text-white'
                  )}
            >
              Cadastro
            </button>
              </div>
          </div>

            {/* Benefits for signup - mais compacto */}
          {mode === 'signup' && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/30 rounded-lg backdrop-blur-sm border border-slate-700/30">
                {benefits.map(({ icon: Icon, label, color }, index) => (
                  <div 
                    key={label} 
                    className="text-center group cursor-default"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 mx-auto mb-1 rounded-full border-2 border-emerald-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Icon className={cn("w-3 h-3", color)} />
                </div>
                    <span className="text-xs text-slate-300">{label}</span>
              </div>
                ))}
            </div>
          )}

          {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
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
                      onChange={handleInputChange('fullName')}
                    placeholder="Como você gostaria de ser chamado?"
                      className={cn(
                        "pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-300",
                        errors.fullName && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                      )}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
                    )}
                  </div>
              </div>
            )}

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
                    onChange={handleInputChange('email')}
                  placeholder="seu@email.com"
                    className={cn(
                      "pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-300",
                      errors.email && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                    )}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
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
                    onChange={handleInputChange('password')}
                  placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                    className={cn(
                      "pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-300",
                      errors.password && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                  )}
                  
                  {/* Password strength indicator */}
                  {mode === 'signup' && formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div 
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all duration-300",
                              i < passwordStrength 
                                ? passwordStrength <= 1 ? 'bg-red-400' 
                                  : passwordStrength <= 2 ? 'bg-yellow-400'
                                  : passwordStrength <= 3 ? 'bg-blue-400'
                                  : 'bg-emerald-400'
                                : 'bg-slate-700'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Força da senha: {
                          passwordStrength <= 1 ? 'Fraca' :
                          passwordStrength <= 2 ? 'Média' :
                          passwordStrength <= 3 ? 'Boa' : 'Forte'
                        }
                      </p>
                    </div>
                  )}
                </div>
            </div>

            <Button 
              type="submit" 
                disabled={loading || !isFormValid}
                className={cn(
                  "w-full py-3 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-900 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                  "transform hover:scale-[1.02] active:scale-[0.98]"
                )}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{mode === 'login' ? 'Entrar na Elite' : 'Começar Jornada'}</span>
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">ou continue com</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
              className="w-full bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                  <span className="text-slate-900 text-xs font-bold">G</span>
              </div>
              <span>Continuar com Google</span>
            </div>
          </Button>

          {/* Switch Mode */}
            <div className="text-center">
              <span className="text-slate-400 text-sm">
              {mode === 'login' ? 'Ainda não faz parte da Elite?' : 'Já é membro da Elite?'}
            </span>{' '}
            <button
              type="button"
              onClick={switchMode}
                className="text-emerald-400 hover:text-emerald-300 font-medium underline transition-colors"
            >
              {mode === 'login' ? 'Cadastre-se Agora' : 'Fazer Login'}
            </button>
          </div>

            {/* Trust indicators - mais compacto */}
            <div className="flex justify-center gap-4">
              {trustIndicators.map(({ icon: Icon, label }, index) => (
                <div 
                  key={label}
                  className="flex items-center gap-1 text-xs text-slate-400 group cursor-default"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-slate-300 transition-colors">{label}</span>
              </div>
              ))}
          </div>

            {/* Success metrics for signup - apenas se necessário */}
          {mode === 'signup' && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-400/20">
              <div className="text-center">
                  <div className="text-emerald-400 font-bold text-sm">457+</div>
                <div className="text-xs text-slate-400">Membros</div>
              </div>
              <div className="text-center">
                  <div className="text-emerald-400 font-bold text-sm">R$ 2.8M</div>
                <div className="text-xs text-slate-400">Comissões</div>
              </div>
              <div className="text-center">
                  <div className="text-emerald-400 font-bold text-sm">89%</div>
                <div className="text-xs text-slate-400">ROI Médio</div>
              </div>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};