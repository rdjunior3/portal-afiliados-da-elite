import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'cyber' | 'gradient' | 'elite';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-slate-900/60 border-slate-700/50 backdrop-blur-sm shadow-lg',
  glass: 'bg-white/5 border-white/10 backdrop-blur-md shadow-xl',
  cyber: 'bg-slate-900/80 border-primary-500/30 shadow-[0_0_20px_rgba(14,165,233,0.3)]',
  gradient: 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/30 shadow-xl',
  elite: 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur-sm shadow-2xl'
};

const sizes = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-xl',
  xl: 'p-8 rounded-2xl'
};

const interactiveStyles = 'transition-all duration-300 hover:transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer';

export const ModernCard: React.FC<ModernCardProps> = ({
  variant = 'default',
  size = 'md',
  interactive = false,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'border',
        variants[variant],
        sizes[size],
        interactive && interactiveStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Sub-componentes para estruturação
export const ModernCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('flex items-center justify-between mb-4', className)}>
    {children}
  </div>
);

export const ModernCardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h3 className={cn('text-lg font-semibold text-white', className)}>
    {children}
  </h3>
);

export const ModernCardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <p className={cn('text-slate-400 text-sm', className)}>
    {children}
  </p>
);

export const ModernCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

export const ModernCardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('mt-4 pt-4 border-t border-slate-700/50', className)}>
    {children}
  </div>
);

// Card especializado para stats
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  className
}) => {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400'
  };

  return (
    <ModernCard 
      variant="glass" 
      interactive 
      className={cn('group', className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium mt-1', trendColors[trend])}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-primary-500/10 rounded-xl group-hover:bg-primary-500/20 transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>
    </ModernCard>
  );
};

// Card para produtos
export const ProductCard: React.FC<{
  name: string;
  description: string;
  image: string;
  price?: number;
  commission?: number;
  tags?: string[];
  onClick?: () => void;
  className?: string;
}> = ({
  name,
  description,
  image,
  price,
  commission,
  tags = [],
  onClick,
  className
}) => {
  return (
    <ModernCard 
      variant="gradient" 
      interactive 
      onClick={onClick}
      className={cn('group overflow-hidden', className)}
    >
      <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden mb-4">
        <img 
          src={image || '/placeholder.svg'} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <ModernCardContent>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {name}
        </h3>
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {(price || commission) && (
          <div className="flex items-center justify-between text-sm">
            {price && (
              <span className="text-white font-medium">
                R$ {price.toLocaleString('pt-BR')}
              </span>
            )}
            {commission && (
              <span className="text-green-400 font-medium">
                {commission}% comissão
              </span>
            )}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};

export default ModernCard; 