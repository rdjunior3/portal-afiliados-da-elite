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
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7849" />
          <stop offset="50%" stopColor="#ff5722" />
          <stop offset="100%" stopColor="#d32f2f" />
        </linearGradient>
        
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffab40" />
          <stop offset="100%" stopColor="#ff6f00" />
        </linearGradient>
        
        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      
      <g>
        <path 
          d="M 150 50 L 80 250 L 120 250 L 135 200 L 165 200 L 180 250 L 220 250 L 150 50 Z M 145 160 L 155 160 L 150 140 Z" 
          fill="url(#mainGradient)"
        />
        
        <path 
          d="M 20 40 L 80 40 L 80 20 L 120 60 L 80 100 L 80 80 L 20 80 Z" 
          fill="url(#arrowGradient)"
        />
        
        <path 
          d="M 150 50 L 120 140 L 135 140 L 150 90 Z" 
          fill="url(#shineGradient)"
        />
      </g>
    </svg>
  );
};

export default BrandIcon; 