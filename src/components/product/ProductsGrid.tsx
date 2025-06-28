
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';

interface ProductsGridProps {
  products: Product[];
  onClearFilters: () => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  onClearFilters
}) => {
  if (products.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Filter className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Aucun produit trouvé
      </h3>
      <p className="text-gray-600 mb-4">
        Essayez de modifier vos critères de recherche
      </p>
      <Button onClick={onClearFilters}>
        Effacer les filtres
      </Button>
    </div>
  );
};
