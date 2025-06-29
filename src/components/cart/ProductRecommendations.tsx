
import React from 'react';
import { Star, ShoppingCart, Brain, Cpu } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProductRecommendationsProps {
  recommendations: Product[];
  loading: boolean;
  isMLEngine?: boolean;
  isMLReady?: boolean;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  recommendations,
  loading,
  isMLEngine = false,
  isMLReady = false
}) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  console.log('ProductRecommendations: Rendering with', recommendations.length, 'recommendations, loading:', loading, 'ML Engine:', isMLEngine);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const getRecommendationIcon = () => {
    if (isMLEngine) {
      return isMLReady ? <Brain className="w-4 h-4" /> : <Cpu className="w-4 h-4" />;
    }
    return null;
  };

  const getRecommendationTitle = () => {
    if (isMLEngine) {
      return isMLReady 
        ? "Recommandations IA Avancées" 
        : "Recommandations IA (Initialisation)";
    }
    return "Recommandations de produits";
  };

  const getRecommendationSubtitle = () => {
    if (isMLEngine) {
      return isMLReady 
        ? "Générées par machine learning (filtrage collaboratif + similarité de contenu)"
        : "Système ML en cours d'initialisation...";
    }
    return "Recommandations générées par notre IA basées sur votre panier";
  };

  if (loading) {
    console.log('ProductRecommendations: Showing loading state');
    return (
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className={`text-xs font-medium px-2 py-1 rounded-full mr-2 flex items-center gap-1 ${
            isMLEngine ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {getRecommendationIcon()}
            IA ML
          </span>
          Analyse des recommandations en cours...
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    console.log('ProductRecommendations: No recommendations found');
    return (
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className={`text-xs font-medium px-2 py-1 rounded-full mr-2 flex items-center gap-1 ${
            isMLEngine ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {getRecommendationIcon()}
            IA {isMLEngine ? 'ML' : ''}
          </span>
          {getRecommendationTitle()}
        </h3>
        <p className="text-gray-600 text-center py-4">
          {isMLEngine 
            ? "Le système ML n'a pas trouvé de recommandations pertinentes pour le moment."
            : "Aucune recommandation disponible pour le moment."
          }
        </p>
      </div>
    );
  }

  console.log('ProductRecommendations: Displaying', recommendations.length, 'recommendations');

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
        <span className={`text-xs font-medium px-2 py-1 rounded-full mr-2 flex items-center gap-1 ${
          isMLEngine ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {getRecommendationIcon()}
          IA {isMLEngine ? 'ML' : ''}
        </span>
        {getRecommendationTitle()} ({recommendations.length})
      </h3>
      
      <p className="text-xs text-gray-600 mb-4">
        {getRecommendationSubtitle()}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-200 hover:scale-105">
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-lg mb-3 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {isMLEngine && (
                <div className="absolute top-2 right-2">
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    ML
                  </span>
                </div>
              )}
            </div>

            {/* Détails du produit */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                {product.name}
              </h4>

              {/* Note */}
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 ml-1">
                  ({product.reviews})
                </span>
              </div>

              {/* Prix */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900">
                    {product.price.toLocaleString()} €
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-500 line-through ml-1">
                      {product.originalPrice.toLocaleString()} €
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className={`text-xs px-3 py-1 ${
                    isMLEngine 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>

              {/* Stock */}
              <div className="text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
