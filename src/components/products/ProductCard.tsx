import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  ExternalLink, 
  Copy, 
  DollarSign, 
  Percent, 
  Tag,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  affiliate_link: string;
  price: number;
  commission_rate: number;
  commission_amount: number;
  tags: string[];
  category?: {
    name: string;
    color: string;
  };
  is_active: boolean;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(product.affiliate_link);
      setCopied(true);
      toast({
        title: "Link copiado! 📋",
        description: "O link de afiliação foi copiado para sua área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVisitProduct = () => {
    window.open(product.affiliate_link, '_blank', 'noopener,noreferrer');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const cardClass = variant === 'compact' ? 'h-80' : variant === 'featured' ? 'h-96' : 'h-auto';

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600 overflow-hidden ${cardClass}`}>
      {/* Imagem do Produto */}
      <div className="relative h-48 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
            <Tag className="h-12 w-12 text-slate-400" />
          </div>
        )}
        
        {/* Overlay com ações rápidas */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleVisitProduct}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyLink}
            className="bg-orange-500/80 hover:bg-orange-500 text-white border-orange-400"
          >
            {copied ? (
              <>✓ Copiado</>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Link
              </>
            )}
          </Button>
        </div>

        {/* Badge da categoria */}
        {product.category && (
          <div className="absolute top-3 left-3">
            <Badge 
              className="text-xs font-medium"
              style={{ 
                backgroundColor: product.category.color + '20',
                color: product.category.color,
                borderColor: product.category.color + '40'
              }}
            >
              {product.category.name}
            </Badge>
          </div>
        )}

        {/* Badge de destaque */}
        {variant === 'featured' && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              ⭐ Destaque
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors">
            {product.name}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-slate-800 text-slate-300 border-slate-600"
              >
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-slate-800 text-slate-400 border-slate-600">
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Informações de preço e comissão */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs font-medium">Preço</span>
            </div>
            <p className="text-white font-semibold">{formatPrice(product.price)}</p>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-3">
            <div className="flex items-center gap-1 text-emerald-400 mb-1">
              <Percent className="h-3 w-3" />
              <span className="text-xs font-medium">Comissão</span>
            </div>
            <p className="text-emerald-400 font-semibold">
              {formatPrice(product.commission_amount)}
            </p>
            <p className="text-emerald-300 text-xs">
              {product.commission_rate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={handleCopyLink}
            className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-0"
          >
            {copied ? (
              <>
                <span className="mr-2">✓</span>
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Pegar Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={handleVisitProduct}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 