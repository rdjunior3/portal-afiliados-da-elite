import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
  customIcon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  showNewProductButton?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  customIcon,
  actions,
  className,
  showNewProductButton = false
}) => {
  const { isAdmin } = useAuth();

  const handleAddNewProduct = () => {
    // Logic to open modal or navigate to the creation page.
    console.log("(Admin) Adicionar novo produto.");
    // In a real app, you would probably use a navigation or state management solution here
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
      className
    )}>
      <div className="flex items-center gap-4">
        {/* Icon Container - Renderização condicional */}
        {(icon || customIcon) && (
          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            {customIcon ? customIcon : <span className="text-xl">{icon}</span>}
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
      <div className="flex items-center gap-3">
        {actions}
        {showNewProductButton && isAdmin() && (
          <Button onClick={handleAddNewProduct}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        )}
      </div>
    </div>
  );
}; 