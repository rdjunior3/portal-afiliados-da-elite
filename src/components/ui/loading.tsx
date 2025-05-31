import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { EliteLogo } from './EliteLogo';

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
  message = 'Carregando Portal da Elite...' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Mobile-first responsive container */}
      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-blue-500/10 rounded-2xl sm:rounded-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400/20 via-transparent to-transparent rounded-2xl sm:rounded-3xl" />
        
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Logo Section - Enhanced Mobile Design */}
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
              <div className="relative">
                {/* Elite Logo with Animation */}
                <EliteLogo 
                  size="lg" 
                  variant="animated" 
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28" 
                />
                
                {/* Enhanced pulse indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50">
                  <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping" />
                </div>
              </div>
              
              {/* Brand Text - Enhanced Responsive Typography */}
              <div className="text-center space-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  AFILIADOS DA ELITE
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-400 font-medium">
                  Portal Premium de Marketing Digital
                </div>
              </div>
            </div>
            
            {/* Loading component */}
            <Loading message={message} size="lg" />
            
            {/* Enhanced Progress indicators */}
            <div className="space-y-4">
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
              
              {/* Status indicator - Enhanced for Mobile */}
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-center">Carregando recursos do portal...</span>
              </div>
            </div>
            
            {/* Mobile-friendly version indicator */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">Versão Mobile Otimizada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 