
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Store } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();

  const isVendorRoute = location.pathname.startsWith('/vendor');

  if (isVendorRoute) {
    return null; // Don't show header on vendor pages
  }

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EcommerceAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Accueil
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              Produits
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition-colors">
              Catégories
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart - Only show for customers */}
            {profile?.role === 'customer' && (
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {loading ? (
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            ) : user && profile ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Bonjour, {profile.first_name || 'Utilisateur'}
                </span>
                {profile.role === 'vendor' ? (
                  <Link to="/vendor">
                    <Button variant="outline" size="sm">
                      <Store className="w-4 h-4 mr-2" />
                      Mon espace vendeur
                    </Button>
                  </Link>
                ) : (
                  <Link to="/my-orders">
                    <Button variant="outline" size="sm">
                      Mes commandes
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <User className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 py-2">
                Accueil
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-blue-600 py-2">
                Produits
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-blue-600 py-2">
                Catégories
              </Link>
              {/* Mobile auth button */}
              {!user && (
                <Link to="/auth" className="py-2">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    <User className="w-4 h-4 mr-2" />
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
