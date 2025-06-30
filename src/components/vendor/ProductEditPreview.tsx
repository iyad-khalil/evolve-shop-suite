
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UseFormReturn } from 'react-hook-form';
import { Eye } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: string;
  stock: number;
  tags: string[];
  images: string[];
}

interface ProductEditPreviewProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductEditPreview: React.FC<ProductEditPreviewProps> = ({ form }) => {
  const formData = form.watch();
  const hasImages = formData.images && formData.images.length > 0;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <span>Aperçu du produit</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image principale */}
        {hasImages && (
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={formData.images[0]}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {!hasImages && (
          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Aucune image</span>
          </div>
        )}

        {/* Informations */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            {formData.name || 'Nom du produit'}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-3">
            {formData.description || 'Description du produit...'}
          </p>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">
              {formData.price ? `${formData.price.toLocaleString()} €` : '0 €'}
            </span>
            {formData.original_price && formData.original_price > formData.price && (
              <span className="text-sm text-gray-500 line-through">
                {formData.original_price.toLocaleString()} €
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={formData.stock > 0 ? "default" : "destructive"}>
              {formData.stock > 0 ? `${formData.stock} en stock` : 'Rupture de stock'}
            </Badge>
            
            {hasImages && formData.images.length > 1 && (
              <span className="text-xs text-gray-500">
                +{formData.images.length - 1} photo(s)
              </span>
            )}
          </div>
        </div>

        {/* Résumé des modifications */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Aperçu en temps réel de vos modifications
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
