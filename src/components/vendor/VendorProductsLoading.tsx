
import React from 'react';

const VendorProductsLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-1/2"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorProductsLoading;
