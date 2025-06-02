import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import EliteLogo from './EliteLogo';

interface LoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  className,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={cn(
          "border-4 border-slate-700 border-t-orange-400 rounded-full animate-spin",
          sizeClasses[size]
        )} />
        
        {/* Inner pulsing icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className={cn(
            "text-orange-400 animate-pulse",
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
          )} />
        </div>
      </div>
      
      {message && (
        <p className={cn(
          "text-slate-300 font-medium animate-pulse",
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        )}>
          {message}
        </p>
      )}
    </div>
  );
};

interface LoadingScreenProps {
  message?: string;
  showTimeout?: boolean;
  onEscape?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando Portal da Elite...',
  showTimeout = false,
  onEscape
}) => {
  const [showEscapeHint, setShowEscapeHint] = React.useState(false);
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    if (showTimeout) {
      const timer = setTimeout(() => {
        setShowEscapeHint(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showTimeout]);

  // Animação dos dots de loading
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects - Mais sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.02)_0%,transparent_50%)] pointer-events-none"></div>
      
      {/* Main Content Container - Design Clean */}
      <div className="relative w-full max-w-sm">
        <div className="text-center space-y-8">
          {/* Logo Section - Redesign Clean */}
          <div className="flex flex-col items-center space-y-4">
            {/* Logo com efeito mais sutil */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-slate-900 text-2xl font-bold">🏆</span>
              </div>
              
              {/* Indicador de status online - mais discreto */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Brand Text - Typography Clean */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                AFILIADOS DA ELITE
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                Portal Premium de Marketing Digital
              </p>
            </div>
          </div>
          
          {/* Loading Spinner - Design Minimalista */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {/* Spinner principal */}
              <div className="w-12 h-12 border-3 border-slate-700 border-t-orange-400 rounded-full animate-spin"></div>
              
              {/* Ícone central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-400 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-slate-900 text-xs font-bold">⚡</span>
                </div>
              </div>
            </div>
            
            {/* Progress Message - Clean */}
            <div className="text-center space-y-3">
              <p className="text-base text-white font-medium">
                {message.replace('...', '')}{dots}
              </p>
              
              {/* Status indicator minimalista */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>
                  {showTimeout && showEscapeHint 
                    ? "Verificação está demorando mais que o normal" 
                    : "Carregando recursos do portal"
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Escape Button - Quando necessário */}
          {showTimeout && showEscapeHint && onEscape && (
            <div className="pt-4">
              <button
                onClick={onEscape}
                className="group px-6 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-orange-500/30 hover:border-orange-400/50 text-orange-400 hover:text-orange-300 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <span>🏠</span>
                  <span>Voltar para página inicial</span>
                </div>
              </button>
            </div>
          )}
          
          {/* Version Indicator - Discreto */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 rounded-full text-xs text-slate-500">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              <span>Versão Mobile Otimizada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 