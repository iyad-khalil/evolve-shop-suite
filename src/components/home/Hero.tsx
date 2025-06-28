
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Store, Users } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Marketplace Multi-Vendeurs
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez des milliers de produits de qualité proposés par nos vendeurs de confiance. 
            De l'électronique à la mode, trouvez tout ce dont vous avez besoin au meilleur prix.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Store className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vendeurs Vérifiés</h3>
              <p className="text-gray-600 text-center">
                Tous nos vendeurs sont soigneusement sélectionnés et vérifiés
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <ShoppingBag className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Large Sélection</h3>
              <p className="text-gray-600 text-center">
                Des milliers de produits dans toutes les catégories
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Communauté Active</h3>
              <p className="text-gray-600 text-center">
                Rejoignez des milliers d'acheteurs satisfaits
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Explorer les Produits
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Devenir Vendeur
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
