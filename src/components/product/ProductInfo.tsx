
import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {product.category}
        </Badge>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              ({product.reviews} avis)
            </span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center space-x-4">
        <span className="text-3xl font-bold text-gray-900">
          {product.price.toLocaleString()} €
        </span>
        {product.originalPrice && (
          <>
            <span className="text-xl text-gray-500 line-through">
              {product.originalPrice.toLocaleString()} €
            </span>
            <Badge variant="destructive">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </Badge>
          </>
        )}
      </div>

      {/* Stock */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className={`font-medium ${
          product.stock > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
        </span>
      </div>
    </div>
  );
};

export default ProductInfo;
