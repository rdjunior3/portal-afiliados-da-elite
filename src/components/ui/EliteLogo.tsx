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
      <svg 
        className={cn(
          iconSizes[size],
          "text-slate-100",
          animated && "transition-all duration-300 ease-in-out group-hover:scale-105"
        )}
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <rect x="7" y="19" width="10" height="2.5" rx="0.5" fill="rgba(0,0,0,0.7)"></rect>
        <rect x="8" y="18.5" width="8" height="1" fill="rgba(0,0,0,0.5)"></rect>
        <rect x="10.5" y="16" width="3" height="3" fill="currentColor"></rect>
        <path d="M6 4C6 3.45 6.45 3 7 3H17C17.55 3 18 3.45 18 4V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9V4Z" fill="currentColor"></path>
        <rect x="7" y="4" width="10" height="0.5" fill="rgba(255,255,255,0.3)"></rect>
        <rect x="7" y="6" width="10" height="0.3" fill="rgba(255,255,255,0.2)"></rect>
        <ellipse cx="5" cy="7.5" rx="1.5" ry="2" fill="currentColor"></ellipse>
        <ellipse cx="19" cy="7.5" rx="1.5" ry="2" fill="currentColor"></ellipse>
        <ellipse cx="5" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"></ellipse>
        <ellipse cx="19" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"></ellipse>
        <text x="12" y="11" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="rgba(255,255,255,0.95)">1</text>
        <g fill="rgba(255,255,255,0.9)">
          <polygon points="9,8 9.2,8.6 9.8,8.6 9.3,9 9.5,9.6 9,9.2 8.5,9.6 8.7,9 8.2,8.6 8.8,8.6"></polygon>
          <polygon points="15,8 15.2,8.6 15.8,8.6 15.3,9 15.5,9.6 15,9.2 14.5,9.6 14.7,9 14.2,8.6 14.8,8.6"></polygon>
          <polygon points="10.5,6 10.6,6.4 11,6.4 10.7,6.7 10.8,7.1 10.5,6.9 10.2,7.1 10.3,6.7 10,6.4 10.4,6.4"></polygon>
          <polygon points="13.5,6 13.6,6.4 14,6.4 13.7,6.7 13.8,7.1 13.5,6.9 13.2,7.1 13.3,6.7 13,6.4 13.4,6.4"></polygon>
          <polygon points="12,5 12.1,5.4 12.5,5.4 12.2,5.7 12.3,6.1 12,5.9 11.7,6.1 11.8,5.7 11.5,5.4 11.9,5.4"></polygon>
        </g>
      </svg>
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