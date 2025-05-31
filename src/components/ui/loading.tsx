import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

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
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando Portal...' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-blue-500/10 rounded-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400/20 via-transparent to-transparent rounded-3xl" />
        
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 shadow-2xl">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-900" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-400 bg-clip-text text-transparent">
                  AFILIADOS DA ELITE
                </div>
                <div className="text-sm text-slate-400">Portal Premium</div>
              </div>
            </div>
            
            {/* Loading component */}
            <Loading message={message} size="lg" />
            
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 