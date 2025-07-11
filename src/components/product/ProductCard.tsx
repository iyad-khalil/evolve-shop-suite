
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous en tant que client pour acheter des produits.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si l'utilisateur est un vendeur
    if (profile?.role === 'vendor') {
      toast({
        title: "Action non autorisée",
        description: "Les vendeurs ne peuvent pas acheter de produits. Veuillez vous connecter avec un compte client.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('ProductCard: Adding product to cart:', {
      name: product.name,
      id: product.id,
      category: product.category,
      category_id: product.category_id
    });
    addToCart(product);
    
    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const canAddToCart = user && profile?.role !== 'vendor' && product.stock > 0;
  const showLoginMessage = !user;
  const isVendor = profile?.role === 'vendor';

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300">
        {/* Image - Taille réduite */}
        <div className="aspect-square overflow-hidden rounded-t-lg h-36">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {product.price.toLocaleString()} €
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {product.originalPrice.toLocaleString()} €
                </span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Stock status and Add to cart */}
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 0 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
            </span>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`transition-colors ${
                canAddToCart 
                  ? 'group-hover:bg-blue-600' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={
                showLoginMessage 
                  ? "Connectez-vous pour acheter" 
                  : isVendor 
                  ? "Les vendeurs ne peuvent pas acheter" 
                  : product.stock === 0 
                  ? "Produit en rupture de stock" 
                  : "Ajouter au panier"
              }
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
