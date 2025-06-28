
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductBreadcrumbProps {
  productName: string;
  category: string;
  onNavigateBack: () => void;
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({
  productName,
  category,
  onNavigateBack
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Button variant="ghost" size="sm" onClick={onNavigateBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux produits
      </Button>
      <span>/</span>
      <span>{category}</span>
      <span>/</span>
      <span className="text-gray-900">{productName}</span>
    </div>
  );
};

export default ProductBreadcrumb;
