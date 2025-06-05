import React from 'react';

interface TrophyIconProps {
  className?: string;
  color?: string;
}

const TrophyIcon: React.FC<TrophyIconProps> = ({ 
  className = "w-4 h-4", 
  color = "currentColor" 
}) => (
  <svg className={className} fill={color} viewBox="0 0 24 24">
    {/* Base/Pedestal */}
    <rect x="7" y="19" width="10" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
    <rect x="8" y="18.5" width="8" height="1" fill="rgba(0,0,0,0.2)"/>
    
    {/* Haste */}
    <rect x="10.5" y="16" width="3" height="3" fill={color}/>
    
    {/* Copa Principal */}
    <path d="M6 4C6 3.45 6.45 3 7 3H17C17.55 3 18 3.45 18 4V9C18 12.31 15.31 15 12 15C8.69 15 6 12.31 6 9V4Z" fill={color}/>
    
    {/* Alças Laterais */}
    <ellipse cx="5" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="19" cy="7.5" rx="1.5" ry="2" fill={color}/>
    <ellipse cx="5" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    <ellipse cx="19" cy="7.5" rx="0.8" ry="1.3" fill="rgba(255,255,255,0.2)"/>
    
    {/* Número 1 Central */}
    <text x="12" y="11" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="rgba(255,255,255,0.95)">1</text>
    
    {/* Estrela decorativa central */}
    <polygon points="12,6 12.1,6.4 12.5,6.4 12.2,6.7 12.3,7.1 12,6.9 11.7,7.1 11.8,6.7 11.5,6.4 11.9,6.4" fill="rgba(255,255,255,0.9)" />
  </svg>
);

export default TrophyIcon; 