import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const CreateLinkModal = ({ isOpen, onClose, product }: CreateLinkModalProps) => {
  const { createAffiliateLink, isCreatingLink } = useAffiliateLinks();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customSlug: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !formData.customSlug.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o slug personalizado.",
        variant: "destructive",
      });
      return;
    }

    // Validar slug (apenas letras, números e hífens)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.customSlug)) {
      toast({
        title: "Slug inválido",
        description: "O slug deve conter apenas letras minúsculas, números e hífens.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAffiliateLink({
        productId: product.id,
        customSlug: formData.customSlug,
        utmCampaign: formData.utmCampaign || undefined,
        utmContent: formData.utmContent || undefined,
        utmTerm: formData.utmTerm || undefined
      });

      // Resetar formulário
      setFormData({
        customSlug: '',
        utmCampaign: '',
        utmContent: '',
        utmTerm: ''
      });

      onClose();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const generateSlug = () => {
    if (!product) return;
    
    const baseSlug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    setFormData(prev => ({
      ...prev,
      customSlug: `${baseSlug}-${randomSuffix}`
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Criar Link de Afiliado</DialogTitle>
          <DialogDescription>
            Configure seu link personalizado para promover este produto
          </DialogDescription>
        </DialogHeader>

        {/* Informações do Produto */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              {product.thumbnail_url && (
                <img 
                  src={product.thumbnail_url} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                <CardDescription className="mt-1">
                  {product.short_description}
                </CardDescription>
                <div className="flex items-center gap-3 mt-2">
                  {product.categories && (
                    <Badge 
                      style={{ backgroundColor: product.categories.color }}
                      className="text-white"
                    >
                      {product.categories.name}
                    </Badge>
                  )}
                  <Badge className="bg-green-600">
                    {product.commission_rate}% comissão
                  </Badge>
                  {product.price && (
                    <span className="text-sm text-slate-300">
                      R$ {product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slug Personalizado */}
          <div className="space-y-2">
            <Label htmlFor="customSlug" className="text-white">
              Slug Personalizado *
            </Label>
            <div className="flex gap-2">
              <Input
                id="customSlug"
                value={formData.customSlug}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                }))}
                placeholder="meu-link-personalizado"
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
              <Button 
                type="button"
                variant="outline"
                onClick={generateSlug}
                className="border-slate-600 text-slate-200"
              >
                Gerar
              </Button>
            </div>
            {formData.customSlug && (
              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                <span className="text-sm text-slate-300 flex-1">
                  https://afiliados.elite.com/go/{formData.customSlug}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(`https://afiliados.elite.com/go/${formData.customSlug}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-slate-400">
              Apenas letras minúsculas, números e hífens. Será usado na URL do seu link.
            </p>
          </div>

          {/* Parâmetros UTM */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Parâmetros de Rastreamento (Opcional)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="utmCampaign" className="text-white">
                  UTM Campaign
                </Label>
                <Input
                  id="utmCampaign"
                  value={formData.utmCampaign}
                  onChange={(e) => setFormData(prev => ({ ...prev, utmCampaign: e.target.value }))}
                  placeholder="promocao-janeiro"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400">
                  Ex: promocao-janeiro, black-friday
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utmContent" className="text-white">
                  UTM Content
                </Label>
                <Input
                  id="utmContent"
                  value={formData.utmContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, utmContent: e.target.value }))}
                  placeholder="banner-topo"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400">
                  Ex: banner-topo, link-bio
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utmTerm" className="text-white">
                UTM Term
              </Label>
              <Input
                id="utmTerm"
                value={formData.utmTerm}
                onChange={(e) => setFormData(prev => ({ ...prev, utmTerm: e.target.value }))}
                placeholder="marketing-digital"
                className="bg-slate-800 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Palavras-chave ou termos de interesse
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-200"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreatingLink || !formData.customSlug.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreatingLink ? 'Criando...' : 'Criar Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLinkModal; 