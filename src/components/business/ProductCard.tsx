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
    <Card className="relative group overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-slate-700/50 hover:border-orange-500/60 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 backdrop-blur-sm max-w-sm mx-auto">
      {/* Admin Controls */}
      {isAdmin() && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {onEdit && (
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-9 w-9 bg-blue-600/90 hover:bg-blue-600 text-white border-none backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-200"
              onClick={() => onEdit(product.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-9 w-9 bg-red-600/90 hover:bg-red-600 text-white border-none backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-200"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge 
          variant={product.status === 'active' ? "default" : "secondary"}
          className={`${product.status === 'active'
            ? "bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30" 
            : "bg-slate-600/90 text-white shadow-lg"
          } backdrop-blur-md border-none px-3 py-1 font-medium`}
        >
          {product.status === 'active' ? (
            <>
              <Star className="h-3 w-3 mr-1" />
              Ativo
            </>
          ) : (
            "Inativo"
          )}
        </Badge>
      </div>

      {/* Product Image - Menor e mais elegante */}
      <div className="relative h-56 overflow-hidden">
        {product.thumbnail_url && !imageError ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <DollarSign className="h-16 w-16 mx-auto mb-3 opacity-90" />
              <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
            </div>
          </div>
        )}
        
        {/* Overlay gradiente mais suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Título sobre a imagem */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-bold text-xl text-white leading-tight line-clamp-2 drop-shadow-lg">
            {product.name}
          </h3>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Descrição */}
        <div>
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Informações Financeiras Destacadas - Design mais elegante */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-300">Comissão de até</span>
            </div>
            <Eye className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-2">
            R$ {maxCommission.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span>Preço até</span>
            <span className="font-semibold text-slate-300">R$ {maxPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Ofertas Disponíveis - Design mais limpo */}
        {product.offers && product.offers.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
              Ofertas Disponíveis
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {product.offers.slice(0, 3).map((offer, index) => (
                <div key={offer.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-orange-500/30 transition-all duration-200 group/offer">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{offer.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="bg-slate-700/50 px-2 py-1 rounded">R$ {offer.price.toFixed(2)}</span>
                      <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded">{offer.commission_rate}%</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="ml-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:scale-105"
                    onClick={() => handleCopyLink(getOfferLink(offer.id, offer.affiliate_link || product.default_offer_affiliate_link || ''))}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Me afiliar
                  </Button>
                </div>
              ))}
              {product.offers.length > 3 && (
                <p className="text-xs text-slate-500 text-center py-2 italic">
                  +{product.offers.length - 3} ofertas adicionais
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-slate-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                  Oferta Principal
                </p>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-2">
                  <span className="bg-slate-700/50 px-2 py-1 rounded">R$ {(product.default_offer_price || 0).toFixed(2)}</span>
                  <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded">{product.default_offer_commission_rate || 0}%</span>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:scale-105"
                onClick={() => handleCopyLink(product.default_offer_affiliate_link || '')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Me afiliar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 