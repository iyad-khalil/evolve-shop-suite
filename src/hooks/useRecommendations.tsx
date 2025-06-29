
import { useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useRecommendations = (cartItems: CartItem[]) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('useRecommendations: Cart items changed:', cartItems);
    if (cartItems.length > 0) {
      generateRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [cartItems]);

  const generateRecommendations = async () => {
    console.log('useRecommendations: Starting to generate recommendations');
    setLoading(true);
    try {
      const allRecommendations: Product[] = [];
      
      for (const item of cartItems) {
        console.log('useRecommendations: Processing item:', item.product.name, 'Category ID:', item.product.category_id);
        
        if (item.product.category_id) {
          const categoryRecommendations = await getRecommendationsByCategory(
            item.product.category_id,
            item.product.id,
            3
          );
          console.log('useRecommendations: Found recommendations for', item.product.name, ':', categoryRecommendations);
          allRecommendations.push(...categoryRecommendations);
        } else {
          console.log('useRecommendations: No category_id for product:', item.product.name);
        }
      }

      // Supprimer les doublons et limiter à 6 produits max
      const uniqueRecommendations = allRecommendations
        .filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )
        .slice(0, 6);

      console.log('useRecommendations: Final unique recommendations:', uniqueRecommendations);
      setRecommendations(uniqueRecommendations);
    } catch (error) {
      console.error('useRecommendations: Erreur lors de la génération des recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationsByCategory = async (
    categoryId: string, 
    excludeProductId: string, 
    limit: number
  ): Promise<Product[]> => {
    console.log('useRecommendations: Fetching recommendations for category:', categoryId, 'excluding:', excludeProductId);
    
    if (!categoryId) {
      console.log('useRecommendations: No categoryId provided');
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', excludeProductId)
      .gt('stock', 0)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('useRecommendations: Erreur lors de la récupération des recommandations:', error);
      return [];
    }

    console.log('useRecommendations: Raw data from Supabase:', data);

    const formattedProducts = (data || []).map(item => {
      const product: Product = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        originalPrice: item.original_price,
        image: item.images?.[0] || '/placeholder.svg',
        images: item.images || [],
        category: item.categories?.name || 'Non catégorisé',
        category_id: item.category_id,
        stock: item.stock,
        rating: item.rating || 0,
        reviews: item.reviews_count || 0,
        tags: item.tags || [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      };
      console.log('useRecommendations: Formatted product:', product.name, 'ID:', product.id);
      return product;
    });

    return formattedProducts;
  };

  return {
    recommendations,
    loading
  };
};
