import React from 'react';
import { cn } from '@/lib/utils';

interface EliteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'animated';
  showGlow?: boolean;
}

export const EliteLogo: React.FC<EliteLogoProps> = ({ 
  className, 
  size = 'md',
  variant = 'default',
  showGlow = true
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const gradientId = `logoGradient-${Math.random().toString(36).substr(2, 9)}`;
  const glowId = `glow-${Math.random().toString(36).substr(2, 9)}`;

  if (variant === 'minimal') {
    return (
      <div className={cn(
        "rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg",
        sizeClasses[size],
        showGlow && "shadow-orange-400/25",
        className
      )}>
        <svg 
          viewBox="0 0 24 24" 
          className="w-1/2 h-1/2 text-slate-900"
          fill="currentColor"
        >
          <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM12 4.44L18.18 9H5.82L12 4.44ZM6.09 11H17.91L17.25 19H6.75L6.09 11Z"/>
          <circle cx="12" cy="14" r="2" fill="#0f172a"/>
        </svg>
      </div>
    );
  }

  return (
    <svg 
      viewBox="0 0 120 120" 
      className={cn(sizeClasses[size], className)}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        {showGlow && (
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>
      
      {/* Outer Ring */}
      <circle 
        cx="60" 
        cy="60" 
        r="55" 
        stroke={`url(#${gradientId})`}
        strokeWidth="3" 
        fill="none"
        opacity={variant === 'animated' ? "0.6" : "0.3"}
      >
        {variant === 'animated' && (
          <animate attributeName="stroke-dasharray" values="0 345;172.5 172.5;0 345" dur="3s" repeatCount="indefinite" />
        )}
      </circle>
      
      {/* Main Logo Circle */}
      <circle 
        cx="60" 
        cy="60" 
        r="45" 
        fill={`url(#${gradientId})`}
        filter={showGlow ? `url(#${glowId})` : undefined}
      />
      
      {/* Elite Star/Diamond */}
      <g transform="translate(60,60)">
        {/* Central Diamond */}
        <path 
          d="M-15,-8 L0,-25 L15,-8 L8,0 L15,8 L0,25 L-15,8 L-8,0 Z" 
          fill="#0F172A"
          stroke="#FFF"
          strokeWidth="1"
        >
          {variant === 'animated' && (
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values="0 0 0;360 0 0" 
              dur="8s" 
              repeatCount="indefinite"
            />
          )}
        </path>
        
        {/* Inner sparkle */}
        <circle cx="0" cy="0" r="3" fill="#F97316">
          {variant === 'animated' && (
            <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
          )}
        </circle>
        
        {/* Side sparkles */}
        <circle cx="-8" cy="-8" r="1.5" fill="#FCD34D" opacity="0.8" />
        <circle cx="8" cy="-8" r="1.5" fill="#FCD34D" opacity="0.8" />
        <circle cx="-8" cy="8" r="1.5" fill="#FCD34D" opacity="0.8" />
        <circle cx="8" cy="8" r="1.5" fill="#FCD34D" opacity="0.8" />
      </g>
      
      {/* Orbital elements */}
      <circle cx="20" cy="30" r="2" fill="#FCD34D" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="90" r="1.5" fill="#F97316" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="25" r="1" fill="#FCD34D" opacity="0.7">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

export default EliteLogo; 