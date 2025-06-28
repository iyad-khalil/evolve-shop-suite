
import React, { useState } from 'react';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import VendorProductsHeader from '@/components/vendor/VendorProductsHeader';
import VendorProductsSearch from '@/components/vendor/VendorProductsSearch';
import VendorProductsTable from '@/components/vendor/VendorProductsTable';
import VendorProductsLoading from '@/components/vendor/VendorProductsLoading';

export const VendorProducts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, loading, handleDeleteProduct } = useVendorProducts();

  if (loading) {
    return <VendorProductsLoading />;
  }

  return (
    <div className="space-y-6">
      <VendorProductsHeader productCount={products.length} />
      
      <VendorProductsSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <VendorProductsTable
        products={products}
        searchTerm={searchTerm}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
};

export default VendorProducts;
