
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingCart, Zap } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { mockProducts } from '@/data/mockData';
import { Button } from '@/components/ui/button';

export const Home: React.FC = () => {
  const featuredProducts = mockProducts.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              La révolution
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                e-commerce IA
              </span>
              commence ici
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Découvrez notre plateforme intelligente qui transforme votre façon de vendre et d'acheter en ligne. 
              IA intégrée, expérience optimisée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  Explorer les produits
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/vendor">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                  Espace vendeur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir EcommerceAI ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre plateforme combine la puissance de l'IA avec une expérience utilisateur exceptionnelle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">IA Intégrée</h3>
              <p className="text-gray-600">
                Recommandations personnalisées, traduction automatique et génération de contenu par IA
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expérience Optimisée</h3>
              <p className="text-gray-600">
                Interface intuitive, recherche avancée et processus d'achat simplifié
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Qualité Premium</h3>
              <p className="text-gray-600">
                Produits sélectionnés, service client 24/7 et garantie satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Produits en vedette
              </h2>
              <p className="text-gray-600">
                Découvrez notre sélection de produits populaires
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                Voir tout
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Produits</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Clients satisfaits</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Disponibilité</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support client</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
