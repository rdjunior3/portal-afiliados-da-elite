import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Trash2, Edit, Eye, DollarSign, Star } from 'lucide-react';
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
  const maxCommission = product.offers && product.offers.length > 0
    ? Math.max(...product.offers.map(offer => (offer.price * offer.commission_rate) / 100))
    : product.default_offer_price && product.default_offer_commission_rate 
      ? (product.default_offer_price * product.default_offer_commission_rate) / 100
      : 0;

  // Calcular preço máximo
  const maxPrice = product.offers && product.offers.length > 0
    ? Math.max(...product.offers.map(offer => offer.price))
    : product.default_offer_price || 0;

  return (
    <Card className="group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/30 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 max-w-sm mx-auto">
      {/* Admin Controls */}
      {isAdmin() && (
        <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {onEdit && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 w-8 p-0 bg-blue-600/90 hover:bg-blue-600 text-white border-none backdrop-blur-md shadow-md"
              onClick={() => onEdit(product.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-8 w-8 p-0 bg-red-600/90 hover:bg-red-600 text-white border-none backdrop-blur-md shadow-md"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge 
          variant={product.status === 'active' ? "default" : "secondary"}
          className={`${product.status === 'active'
            ? "bg-emerald-500/90 text-white" 
            : "bg-slate-600/90 text-white"
          } backdrop-blur-md border-none px-2 py-1 text-xs font-medium`}
        >
          {product.status === 'active' ? (
            <>
              <Star className="h-2 w-2 mr-1" />
              Ativo
            </>
          ) : (
            "Inativo"
          )}
        </Badge>
      </div>

      {/* Product Image - Layout mais limpo */}
      <div className="aspect-video bg-slate-800 rounded-t-lg overflow-hidden">
        {product.thumbnail_url && !imageError ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-90" />
              <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Título e Descrição */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Tags - Se existirem */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Informações Financeiras */}
        <div className="flex items-center justify-between text-sm">
          {maxPrice > 0 && (
            <span className="text-white font-medium">
              R$ {maxPrice.toLocaleString('pt-BR')}
            </span>
          )}
          {maxCommission > 0 && (
            <span className="text-emerald-400 font-medium">
              R$ {maxCommission.toFixed(2)} comissão
            </span>
          )}
        </div>

        {/* Ofertas Disponíveis - Layout simplificado */}
        {product.offers && product.offers.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">
              {product.offers.length} {product.offers.length === 1 ? 'oferta disponível' : 'ofertas disponíveis'}
            </div>
            <div className="space-y-2">
              {product.offers.slice(0, 2).map((offer, index) => (
                <div key={offer.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{offer.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>R$ {offer.price.toFixed(2)}</span>
                      <span className="text-orange-300">{offer.commission_rate}%</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="ml-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 h-auto"
                    onClick={() => handleCopyLink(getOfferLink(offer.id, offer.affiliate_link || product.default_offer_affiliate_link || ''))}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              ))}
              {product.offers.length > 2 && (
                <p className="text-xs text-slate-500 text-center italic">
                  +{product.offers.length - 2} ofertas adicionais
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-sm">Oferta Principal</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>R$ {(product.default_offer_price || 0).toFixed(2)}</span>
                  <span className="text-orange-300">{product.default_offer_commission_rate || 0}%</span>
                </div>
              </div>
              <Button 
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 h-auto"
                onClick={() => handleCopyLink(product.default_offer_affiliate_link || '')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};