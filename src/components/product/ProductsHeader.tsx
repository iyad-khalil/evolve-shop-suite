
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductsHeaderProps {
  productCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  productCount,
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Produits électroniques
        </h1>
        <p className="text-gray-600">
          {productCount} produits trouvés
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onToggleFilters}
        className="md:hidden mt-4"
      >
        <SlidersHorizontal className="w-4 h-4 mr-2" />
        Filtres
      </Button>
    </div>
  );
};
