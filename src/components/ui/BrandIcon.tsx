import React from 'react';
import { cn } from '@/lib/utils';

interface BrandIconProps {
  className?: string;
}

const BrandIcon: React.FC<BrandIconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 300 300"
      className={cn("h-8 w-8", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradiente principal: Azul escuro → Laranja Elite */}
        <linearGradient id="eliteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c1629" />
          <stop offset="30%" stopColor="#1e40af" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        
        {/* Gradiente secundário para detalhes */}
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        
        {/* Gradiente de brilho interno */}
        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="rgba(249,115,22,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Gradiente para sombra interna */}
        <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(12,22,41,0.6)" />
          <stop offset="100%" stopColor="rgba(30,64,175,0.3)" />
        </linearGradient>

        {/* Filtro de brilho para efeito elite */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#glow)">
        {/* Base do troféu - formato Elite mais moderno */}
        <path 
          d="M 150 40 L 70 280 L 230 280 L 150 40 Z" 
          fill="url(#eliteGradient)"
          stroke="url(#accentGradient)"
          strokeWidth="2"
        />
        
        {/* Detalhes internos do troféu - linhas Elite */}
        <path 
          d="M 150 60 L 90 250 L 210 250 L 150 60 Z" 
          fill="none"
          stroke="url(#shineGradient)"
          strokeWidth="1.5"
          opacity="0.7"
        />
        
        {/* Estrela central Elite */}
        <path 
          d="M 150 90 L 160 120 L 190 120 L 170 140 L 180 170 L 150 150 L 120 170 L 130 140 L 110 120 L 140 120 Z" 
          fill="url(#accentGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        
        {/* Elementos decorativos Elite - diamantes */}
        <circle cx="150" cy="200" r="8" fill="url(#shineGradient)" opacity="0.8" />
        <circle cx="130" cy="180" r="4" fill="url(#accentGradient)" opacity="0.6" />
        <circle cx="170" cy="180" r="4" fill="url(#accentGradient)" opacity="0.6" />
        
        {/* Base do troféu */}
        <rect x="120" y="270" width="60" height="20" rx="10" 
              fill="url(#shadowGradient)" 
              stroke="url(#accentGradient)" 
              strokeWidth="1" />
        
        {/* Detalhes de brilho superior */}
        <path 
          d="M 150 40 L 140 80 L 160 80 Z" 
          fill="url(#shineGradient)"
          opacity="0.9"
        />
        
        {/* Linhas de energia Elite - efeito cyber */}
        <path 
          d="M 120 100 L 180 160" 
          stroke="url(#accentGradient)" 
          strokeWidth="2" 
          opacity="0.4"
          strokeLinecap="round"
        />
        <path 
          d="M 180 100 L 120 160" 
          stroke="url(#accentGradient)" 
          strokeWidth="2" 
          opacity="0.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default BrandIcon;