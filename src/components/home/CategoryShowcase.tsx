
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryWithStats {
  id: string;
  name: string;
  description: string;
  productCount: number;
  image: string;
}

export const CategoryShowcase = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-showcase'],
    queryFn: async () => {
      console.log('Fetching categories with product counts...');
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products!inner(id, images)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log('Categories fetched:', data);

      // Grouper les produits par catégorie et compter
      const categoriesWithStats: CategoryWithStats[] = data.map(category => {
        const products = category.products || [];
        const firstProductImage = products.find(p => p.images && p.images.length > 0)?.images?.[0];
        
        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          productCount: products.length,
          image: firstProductImage || '/placeholder.svg'
        };
      }).filter(category => category.productCount > 0);

      return categoriesWithStats;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explorez nos catégories</h2>
            <p className="text-gray-600">Trouvez exactement ce que vous cherchez</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative">
                  <Skeleton className="h-36 w-full" />
                </div>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-5 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explorez nos catégories</h2>
          <p className="text-gray-600">Trouvez exactement ce que vous cherchez</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors duration-300" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <Badge variant="secondary">
                    {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
