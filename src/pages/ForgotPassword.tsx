import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (!error) {
        setEmailSent(true);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro durante o processo de recuperação.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.03)_0%,transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.02)_0%,transparent_50%)] pointer-events-none"></div>
        
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Email enviado!</h1>
              <p className="text-slate-400">
                Enviamos um link de recuperação para <span className="text-orange-400 font-medium">{email}</span>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">Próximos passos:</h3>
              <div className="text-sm text-slate-300 space-y-2">
                <p>• Verifique sua caixa de entrada</p>
                <p>• Procure também na pasta de spam</p>
                <p>• Clique no link para redefinir sua senha</p>
                <p>• O link expira em 1 hora</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button 
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500"
              >
                Enviar novamente
              </Button>
              
              <Link
                to="/login"
                className="block text-center text-orange-400 hover:text-orange-300 font-medium underline transition-colors"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.02)_0%,transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-3 slide-in-left">
                <div className="relative group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <TrophyIcon className="w-7 h-7" color="#1e293b" />
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
            <h1 className="text-2xl font-bold text-white mb-2">Recuperar senha</h1>
            <p className="text-slate-400">Digite seu email para receber o link de recuperação</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                Email cadastrado
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-400 focus:ring-orange-400/20"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
                              className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 text-slate-100 font-semibold transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Enviar link de recuperação</span>
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="text-slate-400 text-sm">
              Lembrou da senha? 
            </span>{' '}
            <Link
              to="/login"
              className="text-orange-400 hover:text-orange-300 font-medium underline transition-colors"
            >
              Fazer login
            </Link>
          </div>
        </div>

        {/* Help info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Não recebeu o email? Verifique a pasta de spam ou</p>
          <p>entre em contato com nosso suporte.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 