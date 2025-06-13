import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Trash2 } from 'lucide-react';
import { ProductWithOffers } from '@/types'; // Assuming you have this type from your previous setup
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { useAuth } from '@/contexts/AuthContext';

interface ProductCardProps {
  product: ProductWithOffers;
  onDelete: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  const { toast } = useToast();
  const { links, loading: linksLoading, error: linksError } = useAffiliateLinks(product.id);
  const { user, profile } = useAuth();

  // Verificar se o usuário é admin
  const isAdmin = profile?.role === 'admin';

  const handleCopyLink = (url: string) => {
    if (!url) {
      toast({ title: "Link indisponível", variant: "destructive" });
      return;
    }
    navigator.clipboard.writeText(url);
    toast({ title: "Link de promoção copiado!" });
  };

  // Decide which link to use: affiliate link if available, otherwise affiliate_link
  const getOfferLink = (offerId: string, defaultLink: string) => {
    const affiliateLink = links.find(link => link.offer_id === offerId);
    return affiliateLink ? affiliateLink.affiliate_url : defaultLink;
  };

  return (
    <Card key={product.id} className="bg-slate-800 border-slate-700 flex flex-col group relative">
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(product.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-white">{product.name}</CardTitle>
        <CardDescription>{product.short_description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-slate-300 line-clamp-3">{product.description}</p>
        <h4 className="font-semibold text-white">Ofertas Disponíveis:</h4>
        <div className="space-y-2">
          {product.offers && product.offers.length > 0 ? (
            product.offers.map((offer) => (
              <div key={offer.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">{offer.name}</p>
                  <div className="text-xs text-slate-300">
                    <span>Preço: <span className="text-green-400">R$ {offer.price.toFixed(2)}</span></span>
                    <span className="mx-2">|</span>
                    <span>Comissão: <span className="text-orange-400">{offer.commission_rate}%</span></span>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleCopyLink(getOfferLink(offer.id, offer.affiliate_link || ''))}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 flex justify-between items-center">
              <div>
                <p className="font-medium text-white">Oferta Padrão</p>
                <div className="text-xs text-slate-300">
                  <span>Preço: <span className="text-green-400">R$ {product.default_offer_price?.toFixed(2) || 'N/A'}</span></span>
                  <span className="mx-2">|</span>
                  <span>Comissão: <span className="text-orange-400">{product.default_offer_commission_rate || 0}%</span></span>
                </div>
              </div>
              <Button size="sm" onClick={() => handleCopyLink(product.default_offer_affiliate_link || '')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 