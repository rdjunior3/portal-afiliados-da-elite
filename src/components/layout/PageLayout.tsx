import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  hasHeader?: boolean;
  headerContent?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className,
  hasHeader = true,
  headerContent 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Page Header Section */}
      {hasHeader && headerContent && (
        <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {headerContent}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        hasHeader && headerContent ? "py-8" : "py-8",
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