import React from 'react';
import { cn } from '@/lib/utils';

interface EliteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

// Custom Trophy SVG Icon with unique gradient ID
const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => {
  // Generate unique ID to avoid conflicts with multiple instances
  const gradientId = React.useMemo(() => 
    `trophyGradient-${Math.random().toString(36).substr(2, 9)}`, 
    []
  );

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      
      {/* Trophy Cup */}
      <path 
        d="M7 8h10l-1 8H8l-1-8z" 
        fill={`url(#${gradientId})`}
        stroke="#FFFFFF" 
        strokeWidth="0.5"
      />
      
      {/* Trophy Handles */}
      <path 
        d="M6 10a2 2 0 01-2-2V7a1 1 0 011-1h1m12 4a2 2 0 002-2V7a1 1 0 00-1-1h-1" 
        stroke="#FFFFFF" 
        strokeWidth="1" 
        fill="none"
      />
      
      {/* Trophy Base */}
      <rect 
        x="9" 
        y="16" 
        width="6" 
        height="2" 
        fill={`url(#${gradientId})`}
        stroke="#FFFFFF" 
        strokeWidth="0.5"
      />
      <rect 
        x="8" 
        y="18" 
        width="8" 
        height="1.5" 
        fill={`url(#${gradientId})`}
        stroke="#FFFFFF" 
        strokeWidth="0.5"
      />
      
      {/* Decorative star */}
      <circle cx="12" cy="12" r="1.5" fill="#FCD34D" opacity="0.8" />
    </svg>
  );
};

const EliteLogo: React.FC<EliteLogoProps> = ({ 
  className, 
  size = 'md', 
  showText = true, 
  animated = true 
}) => {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Trophy Icon Container */}
      <div className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-lg border border-orange-300/30",
        containerSizes[size],
        animated && "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25"
      )}>
        {/* Custom Trophy Icon */}
        <TrophyIcon className={cn(iconSizes[size], "text-white")} />
        
        {/* Subtle Glow Effect */}
        {animated && (
          <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 hover:opacity-10 transition-opacity duration-300" />
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold text-orange-400 tracking-tight leading-none",
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base'
          )}>
            AFILIADOS ELITE
          </span>
          {size !== 'sm' && (
            <span className={cn(
              "text-xs text-slate-400 font-medium leading-none mt-0.5",
              size === 'lg' ? 'text-sm' : size === 'xl' ? 'text-base' : 'text-xs'
            )}>
              Portal Premium
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EliteLogo; 