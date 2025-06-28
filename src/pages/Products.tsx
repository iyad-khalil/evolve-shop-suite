
import React from 'react';
import { ProductsHeader } from '@/components/product/ProductsHeader';
import { ProductsFilters } from '@/components/product/ProductsFilters';
import { ProductsGrid } from '@/components/product/ProductsGrid';
import { useProducts } from '@/hooks/useProducts';

const Products: React.FC = () => {
  const {
    products,
    categories,
    loading,
    searchTerm,
    selectedCategory,
    sortBy,
    priceRange,
    showFilters,
    handleSearch,
    handleCategoryChange,
    setSortBy,
    setPriceRange,
    setShowFilters,
    clearFilters
  } = useProducts();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductsHeader
        productCount={products.length}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <ProductsFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          priceRange={priceRange}
          categories={categories}
          showFilters={showFilters}
          onSearchChange={handleSearch}
          onCategoryChange={handleCategoryChange}
          onSortChange={setSortBy}
          onPriceRangeChange={setPriceRange}
          onClearFilters={clearFilters}
        />

        <div className="flex-1">
          <ProductsGrid
            products={products}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
