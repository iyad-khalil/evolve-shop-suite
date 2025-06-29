
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedProducts = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      console.log('Fetching featured products...');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      console.log('Featured products fetched:', data);

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        originalPrice: item.original_price,
        image: item.images?.[0] || '/placeholder.svg',
        images: item.images || [],
        category: item.categories?.name || 'Non catégorisé',
        stock: item.stock,
        rating: item.rating || 0,
        reviews: item.reviews_count || 0,
        tags: item.tags || [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        vendor_id: item.vendor_id
      })) as Product[];
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Produits en vedette</h2>
            <p className="text-gray-600">Découvrez notre sélection de produits populaires</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Produits en vedette</h2>
          <p className="text-gray-600">Découvrez notre sélection de produits populaires</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
