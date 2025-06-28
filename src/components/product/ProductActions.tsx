
import React from 'react';
import { ShoppingCart, Heart, Share2, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface ProductActionsProps {
  product: Product;
  isFavorite: boolean;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  isFavorite,
  onAddToCart,
  onToggleFavorite,
  onShare
}) => {
  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          onClick={onAddToCart}
          disabled={product.stock === 0}
          className="flex-1"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Ajouter au panier
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onToggleFavorite}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onShare}
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-green-600" />
          <span className="text-sm">Livraison gratuite</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm">Garantie 2 ans</span>
        </div>
      </div>
    </div>
  );
};

export default ProductActions;
