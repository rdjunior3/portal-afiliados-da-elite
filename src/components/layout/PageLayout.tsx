import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  hasHeader?: boolean;
  headerContent?: React.ReactNode;
  fullWidth?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className,
  hasHeader = true,
  headerContent,
  fullWidth = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Page Header Section */}
      {hasHeader && headerContent && (
        <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className={cn(
            "mx-auto px-4 sm:px-6 lg:px-8 py-8",
            fullWidth ? "w-full" : "max-w-7xl"
          )}>
            {headerContent}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 py-8",
        fullWidth ? "w-full" : "max-w-7xl",
        className
      )}>
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContent: React.FC<PageContentProps> = ({ children, className }) => {
  return (
    <div className={cn("space-y-8", className)}>
      {children}
    </div>
  );
}; 