
import React from 'react';
import { ShoppingCart, Share2, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface ProductActionsProps {
  product: Product;
  onAddToCart: () => void;
  onShare: () => void;
  canAddToCart: boolean;
  isVendor: boolean;
  isLoggedIn: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onAddToCart,
  onShare,
  canAddToCart,
  isVendor,
  isLoggedIn
}) => {
  const getButtonText = () => {
    if (!isLoggedIn) {
      return "Se connecter pour acheter";
    }
    if (isVendor) {
      return "Vendeurs non autorisés";
    }
    if (product.stock === 0) {
      return "Rupture de stock";
    }
    return "Ajouter au panier";
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          onClick={onAddToCart}
          disabled={!canAddToCart}
          className="flex-1"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {getButtonText()}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onShare}
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages d'information */}
      {!isLoggedIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Connectez-vous en tant que client</strong> pour acheter des produits et bénéficier de toutes nos fonctionnalités.
          </p>
        </div>
      )}

      {isVendor && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>Compte vendeur détecté :</strong> Les vendeurs ne peuvent pas acheter de produits. Veuillez vous connecter avec un compte client pour effectuer des achats.
          </p>
        </div>
      )}

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
