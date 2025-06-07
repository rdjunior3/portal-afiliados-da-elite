import React from 'react';
import { cn } from '@/lib/utils';

interface EliteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

const EliteLogo: React.FC<EliteLogoProps> = ({ 
  className, 
  size = 'md', 
  showText = true, 
  animated = true 
}) => {
  const containerSizes = {
    sm: 'gap-2',
    md: 'gap-3', 
    lg: 'gap-3',
    xl: 'gap-4'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={cn("flex items-center", containerSizes[size], className)}>
      <img 
        src="/elite-logo.svg" 
        alt="Elite Afiliados Logo" 
        className={cn(
          iconSizes[size],
          animated && "transition-all duration-300 ease-in-out group-hover:scale-105"
        )}
      />
      {showText && (
        <span className={cn(
          "font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500",
          textSizes[size]
        )}>
          Afiliados da Elite
        </span>
      )}
    </div>
  );
};

export default EliteLogo; 