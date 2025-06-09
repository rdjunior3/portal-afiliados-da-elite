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
    <div>
      {/* Page Header Section */}
      {hasHeader && headerContent && (
        <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {headerContent}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={cn(
        "px-4 sm:px-6 lg:px-8 py-8",
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