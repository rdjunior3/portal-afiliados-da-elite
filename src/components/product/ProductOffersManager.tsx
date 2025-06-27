import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, DollarSign, Percent, Star, Move } from 'lucide-react';
import { ProductOffer, ProductOfferFormData, validateOffer, sortOffers, calculateOfferPricing } from '@/types/product-offers.types';
import { formatCurrency } from '@/lib/utils';

interface ProductOffersManagerProps {
  offers: ProductOffer[];
  onChange: (offers: ProductOffer[]) => void;
  productId?: string;
}

const ProductOffersManager: React.FC<ProductOffersManagerProps> = ({
  offers,
  onChange,
  productId
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductOfferFormData>({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    commission_rate: 0,
    commission_amount: 0,
    affiliate_link: '',
    is_default: false,
    is_active: true,
    sort_order: 0
  });
  const [errors, setErrors] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      commission_rate: 0,
      commission_amount: 0,
      affiliate_link: '',
      is_default: false,
      is_active: true,
      sort_order: offers.length
    });
    setErrors([]);
    setEditingIndex(null);
  };

  const handleAddOffer = () => {
    setEditingIndex(-1); // -1 indica nova oferta
    // Limpa o formulário em vez de manter dados anteriores
    setFormData({
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      commission_rate: 0,
      commission_amount: 0,
      affiliate_link: '',
      is_default: offers.length === 0, // Primeira oferta é padrão
      is_active: true,
      sort_order: offers.length
    });
    setErrors([]);
  };

  const handleEditOffer = (index: number) => {
    const offer = offers[index];
    setEditingIndex(index);
    setFormData({
      name: offer.name,
      description: offer.description || '',
      price: offer.price,
      original_price: offer.original_price || 0,
      commission_rate: offer.commission_rate,
      commission_amount: offer.commission_amount || 0,
      affiliate_link: offer.affiliate_link,
      is_default: offer.is_default,
      is_active: offer.is_active,
      sort_order: offer.sort_order
    });
    setErrors([]);
  };

  const handleSaveOffer = () => {
    const validationErrors = validateOffer(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newOffers = [...offers];
    
    if (editingIndex === -1) {
      // Nova oferta
      const newOffer: ProductOffer = {
        id: `temp_${Date.now()}_${Math.random()}`, // ID temporário
        product_id: productId || '',
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Se for marcada como padrão, desmarcar outras
      if (formData.is_default) {
        newOffers.forEach(offer => offer.is_default = false);
      }
      
      newOffers.push(newOffer);
    } else {
      // Editar oferta existente
      const existingOffer = newOffers[editingIndex];
      
      // Se for marcada como padrão, desmarcar outras
      if (formData.is_default && !existingOffer.is_default) {
        newOffers.forEach(offer => offer.is_default = false);
      }
      
      newOffers[editingIndex] = {
        ...existingOffer,
        ...formData,
        updated_at: new Date().toISOString()
      };
    }

    onChange(sortOffers(newOffers));
    resetForm();
  };

  const handleDeleteOffer = (index: number) => {
    const newOffers = offers.filter((_, i) => i !== index);
    
    // Se a oferta deletada era padrão e há outras ofertas, tornar a primeira como padrão
    if (offers[index].is_default && newOffers.length > 0) {
      newOffers[0].is_default = true;
    }
    
    onChange(newOffers);
  };

  const handleSetDefault = (index: number) => {
    const newOffers = offers.map((offer, i) => ({
      ...offer,
      is_default: i === index
    }));
    onChange(newOffers);
  };

  const moveOffer = (fromIndex: number, toIndex: number) => {
    const newOffers = [...offers];
    const [movedOffer] = newOffers.splice(fromIndex, 1);
    newOffers.splice(toIndex, 0, movedOffer);
    
    // Atualizar sort_order
    newOffers.forEach((offer, index) => {
      offer.sort_order = index;
    });
    
    onChange(newOffers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Ofertas do Produto</h3>
          <p className="text-sm text-slate-400">
            Configure diferentes preços e comissões para o mesmo produto
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddOffer}
          className="bg-green-600 hover:bg-green-700"
          disabled={editingIndex !== null}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Oferta
        </Button>
      </div>

      {/* Lista de ofertas existentes */}
      <div className="space-y-3">
        {sortOffers(offers).map((offer, index) => {
          const pricing = calculateOfferPricing(offer);
          
          return (
            <Card key={offer.id} className="bg-slate-700/30 border-slate-600/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{offer.name}</h4>
                      {offer.is_default && (
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                          <Star className="h-3 w-3 mr-1" />
                          Padrão
                        </Badge>
                      )}
                      {!offer.is_active && (
                        <Badge variant="secondary" className="bg-slate-600/20 text-slate-400">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    
                    {offer.description && (
                      <p className="text-sm text-slate-300 mb-3">{offer.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Preço:</span>
                        <div className="font-medium text-white">
                          {formatCurrency(offer.price)}
                          {pricing.original_price && (
                            <span className="text-xs text-slate-400 line-through ml-2">
                              {formatCurrency(pricing.original_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-slate-400">Comissão:</span>
                        <div className="font-medium text-green-400">
                          {offer.commission_rate}% = {formatCurrency(pricing.commission_value)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-slate-400">Ordem:</span>
                        <div className="font-medium text-white">#{offer.sort_order + 1}</div>
                      </div>
                      
                      <div>
                        <span className="text-slate-400">Link:</span>
                        <div className="font-medium text-blue-400 truncate">
                          {offer.affiliate_link ? '✓ Configurado' : '✗ Não configurado'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!offer.is_default && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(index)}
                        className="text-orange-400 hover:text-orange-300"
                        title="Definir como padrão"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOffer(index)}
                      className="text-blue-400 hover:text-blue-300"
                      disabled={editingIndex !== null}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOffer(index)}
                      className="text-red-400 hover:text-red-300"
                      disabled={offers.length <= 1 || editingIndex !== null}
                      title={offers.length <= 1 ? "Deve ter pelo menos uma oferta" : "Deletar oferta"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Formulário de edição/criação */}
      {editingIndex !== null && (
        <Card className="bg-slate-800/60 border-slate-600/50">
          <CardHeader>
            <CardTitle className="text-white">
              {editingIndex === -1 ? 'Nova Oferta' : 'Editar Oferta'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exibir erros */}
            {errors.length > 0 && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <ul className="text-sm text-red-200 space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Nome da Oferta *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Oferta Básica, Premium, Completa"
                  className="bg-slate-700/60 border-slate-600/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Link de Afiliado *</Label>
                <Input
                  value={formData.affiliate_link}
                  onChange={(e) => setFormData({...formData, affiliate_link: e.target.value})}
                  placeholder="https://exemplo.com/produto"
                  className="bg-slate-700/60 border-slate-600/50 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva esta oferta específica"
                className="bg-slate-700/60 border-slate-600/50 text-white"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Preço (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    placeholder="0.00"
                    className="pl-10 bg-slate-700/60 border-slate-600/50 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Preço Original</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData({...formData, original_price: Number(e.target.value)})}
                    placeholder="0.00"
                    className="pl-10 bg-slate-700/60 border-slate-600/50 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Comissão (%) *</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.commission_rate || ''}
                    onChange={(e) => setFormData({...formData, commission_rate: Number(e.target.value)})}
                    placeholder="0"
                    className="pl-10 bg-slate-700/60 border-slate-600/50 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Comissão Fixa</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.commission_amount || ''}
                    onChange={(e) => setFormData({...formData, commission_amount: Number(e.target.value)})}
                    placeholder="0.00"
                    className="pl-10 bg-slate-700/60 border-slate-600/50 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                  className="rounded"
                />
                Oferta padrão
              </label>

              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded"
                />
                Ativa
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-600/50">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-slate-600 text-slate-300"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveOffer}
                className="bg-green-600 hover:bg-green-700"
              >
                {editingIndex === -1 ? 'Adicionar Oferta' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre as ofertas */}
      {offers.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma oferta configurada</p>
          <p className="text-sm">Adicione pelo menos uma oferta para o produto</p>
        </div>
      )}
    </div>
  );
};

export default ProductOffersManager; 