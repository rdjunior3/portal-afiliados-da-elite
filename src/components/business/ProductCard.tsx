import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Trash2, Edit, Eye, DollarSign } from 'lucide-react';
import { ProductWithOffers } from '@/types';
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { useAuth } from '@/contexts/AuthContext';

interface ProductCardProps {
  product: ProductWithOffers;
  onDelete: (productId: string) => void;
  onEdit?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onEdit }) => {
  const { toast } = useToast();
  const { links, loading: linksLoading, error: linksError } = useAffiliateLinks(product.id);
  const { isAdmin } = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleCopyLink = (url: string) => {
    if (!url) {
      toast({ title: "Link indisponível", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(url);
    toast({ 
      title: "Link copiado! 📋", 
      description: "O link foi copiado para a área de transferência.",
      className: "bg-green-600 text-white border-green-500"
    });
  };

  // Decide which link to use: affiliate link if available, otherwise sales_page_url
  const getOfferLink = (offerId: string, salesPageUrl: string) => {
    const affiliateLink = links.find(link => link.offer_id === offerId);
    return affiliateLink ? affiliateLink.affiliate_url : salesPageUrl;
  };

  // Calcular maior comissão disponível
  const maxCommission = product.product_offers && product.product_offers.length > 0
    ? Math.max(...product.product_offers.map(offer => (offer.price * offer.commission_rate) / 100))
    : (product.price * product.commission_rate) / 100;

  // Calcular preço máximo
  const maxPrice = product.product_offers && product.product_offers.length > 0
    ? Math.max(...product.product_offers.map(offer => offer.price))
    : product.price;

  return (
    <Card className="relative group overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
      {/* Admin Controls */}
      {isAdmin() && (
        <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 bg-blue-600/90 hover:bg-blue-600 text-white border-none backdrop-blur-sm"
              onClick={() => onEdit(product.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8 bg-red-600/90 hover:bg-red-600 text-white border-none backdrop-blur-sm"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge 
          variant={product.is_active ? "default" : "secondary"}
          className={product.is_active 
            ? "bg-green-600/90 text-white backdrop-blur-sm" 
            : "bg-gray-600/90 text-white backdrop-blur-sm"
          }
        >
          {product.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        {product.image_url && !imageError ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-80" />
              <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
            </div>
          </div>
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Título e Descrição */}
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-white leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-slate-300 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Informações Financeiras Destacadas */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-lg p-4 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-300">Comissão de até:</span>
            <Eye className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            R$ {maxCommission.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400">
            Preço máximo até R$ {maxPrice.toFixed(2)}
          </div>
        </div>

        {/* Ofertas Disponíveis */}
        {product.product_offers && product.product_offers.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">Ofertas Disponíveis:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {product.product_offers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md border border-slate-600/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{offer.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span>R$ {offer.price.toFixed(2)}</span>
                      <span className="text-orange-400">{offer.commission_rate}%</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="ml-2 h-8 w-8 p-0 border-orange-500/50 hover:bg-orange-600 hover:border-orange-600 text-orange-400 hover:text-white"
                    onClick={() => handleCopyLink(getOfferLink(offer.id, offer.affiliate_link || product.sales_page_url || ''))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {product.product_offers.length > 2 && (
                <p className="text-xs text-slate-400 text-center py-1">
                  +{product.product_offers.length - 2} ofertas adicionais
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div>
              <p className="font-medium text-white">Oferta Principal</p>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span>R$ {product.price.toFixed(2)}</span>
                <span className="text-orange-400">{product.commission_rate}%</span>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white border-none"
              onClick={() => handleCopyLink(product.sales_page_url || '')}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 