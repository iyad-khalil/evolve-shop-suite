
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';

export const VendorBreakdown = () => {
  const { analyzeCartVendors } = useOrders();
  const { vendorInfo } = analyzeCartVendors();

  const vendorCount = Object.keys(vendorInfo).length;

  if (vendorCount === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Répartition par vendeur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(vendorInfo).map(([vendorId, info]) => (
            <div key={vendorId} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {info.name}
                </Badge>
                <span className="text-sm text-gray-600">
                  {info.count} article{info.count > 1 ? 's' : ''}
                </span>
              </div>
              <span className="font-semibold">
                {info.total.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
        {vendorCount > 1 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Info :</strong> Votre commande implique {vendorCount} vendeurs différents. 
              Chaque vendeur traitera et expédiera ses produits séparément.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
