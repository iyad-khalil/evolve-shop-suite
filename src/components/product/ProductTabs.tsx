
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface ProductTabsProps {
  product: Product;
  user: any;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ product, user }) => {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Caractéristiques</TabsTrigger>
        <TabsTrigger value="reviews">Avis ({product.reviews})</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-700 leading-relaxed">
              {product.description || 'Aucune description disponible pour ce produit.'}
            </p>
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Tags :</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardContent className="p-6">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => {
                  if (!value) return null;
                  
                  const label = {
                    brand: 'Marque',
                    model: 'Modèle',
                    processor: 'Processeur',
                    ram: 'Mémoire RAM',
                    storage: 'Stockage',
                    screen_size: 'Taille d\'écran',
                    screen_resolution: 'Résolution',
                    operating_system: 'Système d\'exploitation',
                    battery_life: 'Autonomie',
                    weight: 'Poids',
                    warranty: 'Garantie',
                    color: 'Couleur',
                    dimensions: 'Dimensions',
                    graphics: 'Carte graphique',
                    camera: 'Caméra',
                    sound: 'Audio',
                    material: 'Matériaux'
                  }[key] || key;

                  return (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-900">{label}</span>
                      <span className="text-gray-700">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucune spécification technique disponible pour ce produit.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Aucun avis pour le moment.
              </p>
              {user && (
                <Button variant="outline">
                  Laisser un avis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
