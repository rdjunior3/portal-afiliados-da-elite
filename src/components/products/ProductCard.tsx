import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onCreateLink?: (productId: string) => void;
  onRequestApproval?: (productId: string) => void;
  isApproved?: boolean;
  isLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onCreateLink,
  onRequestApproval,
  isApproved = false,
  isLoading = false
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        {product.image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {product.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Preço:</span>
            <span className="font-bold">{formatCurrency(product.price)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Comissão:</span>
            <Badge variant="secondary">
              {product.commission_rate}%
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Vendas:</span>
            <span className="text-sm">{product.total_sales}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {isApproved ? (
          <Button 
            onClick={() => onCreateLink?.(product.id)}
            disabled={isLoading}
            className="w-full"
          >
            Criar Link
          </Button>
        ) : (
          <Button 
            onClick={() => onRequestApproval?.(product.id)}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            Solicitar Aprovação
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard; 