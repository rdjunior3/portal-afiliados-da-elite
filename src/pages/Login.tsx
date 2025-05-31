import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no login',
          description: error.message
        });
      } else {
        toast({
          variant: 'success',
          title: 'Login realizado!',
          description: 'Bem-vindo de volta à sua área de membros.'
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o login.'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.02)_0%,transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full max-w-md">
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

        {/* Login Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-3 slide-in-left">
                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-lg">
                    <span className="text-xl">🏆</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-orange-400 tracking-tight">
                    AFILIADOS DA ELITE
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Portal Premium de Marketing Digital
                  </span>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Acesse sua área</h1>
            <p className="text-slate-400">Entre em sua conta para gerenciar suas comissões</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Sua senha"
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
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 text-slate-900 font-semibold transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar na Área de Membros'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-4 my-6">
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
            className="w-full bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <span className="text-slate-900 text-xs font-bold">G</span>
              </div>
              <span>Continuar com Google</span>
            </div>
          </Button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="text-slate-400 text-sm">
              Ainda não tem acesso? 
            </span>{' '}
            <Link
              to="/signup"
              className="text-orange-400 hover:text-orange-300 font-medium underline transition-colors"
            >
              Cadastre-se
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex justify-center gap-6 mt-6 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>100% Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>SSL Criptografado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>Dados Protegidos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 