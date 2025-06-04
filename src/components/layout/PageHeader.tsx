import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  actions,
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
      className
    )}>
      <div className="flex items-center gap-4">
        {/* Icon Container - Renderização condicional */}
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-xl">{icon}</span>
          </div>
        )}
        
        {/* Title and Description */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {title}
          </h1>
          <p className="text-slate-300 mt-1">
            {description}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}; 