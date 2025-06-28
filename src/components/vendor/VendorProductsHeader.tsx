
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorProductsHeaderProps {
  productCount: number;
}

const VendorProductsHeader: React.FC<VendorProductsHeaderProps> = ({ productCount }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes produits</h1>
        <p className="text-gray-600 mt-1">
          Gérez votre catalogue de {productCount} produits
        </p>
      </div>
      <Link to="/vendor/products/new">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </Link>
    </div>
  );
};

export default VendorProductsHeader;
