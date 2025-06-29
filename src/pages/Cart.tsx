
import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMLRecommendations } from '@/hooks/useMLRecommendations';
import { Button } from '@/components/ui/button';
import { ProductRecommendations } from '@/components/cart/ProductRecommendations';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { recommendations, loading: recommendationsLoading, isMLReady } = useMLRecommendations(items);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et ajoutez-les à votre panier.
            </p>
            <Link to="/products">
              <Button size="lg">
                Parcourir les produits
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Panier ({items.length} article{items.length > 1 ? 's' : ''})
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vider le panier
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variant?.id || 'default'}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.product.description}</p>
                    {item.variant && (
                      <p className="text-sm text-gray-500 mt-1">
                        Variante: {item.variant.name} - {item.variant.value}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">{item.product.category}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {((item.variant?.price || item.product.price) * item.quantity).toLocaleString()} €
                    </p>
                    <p className="text-sm text-gray-500">
                      {(item.variant?.price || item.product.price).toLocaleString()} € / unité
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(item.product.id, item.variant)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations IA ML */}
          <ProductRecommendations 
            recommendations={recommendations}
            loading={recommendationsLoading}
            isMLEngine={true}
            isMLReady={isMLReady}
          />

          {/* Cart Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                {total.toLocaleString()} €
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="flex-1">
                <Button variant="outline" className="w-full">
                  Continuer mes achats
                </Button>
              </Link>
              {user ? (
                <Link to="/checkout" className="flex-1">
                  <Button className="w-full" size="lg">
                    Passer commande
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" className="flex-1">
                  <Button className="w-full" size="lg">
                    Se connecter pour commander
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
