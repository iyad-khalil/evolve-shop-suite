
import { useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useRecommendations = (cartItems: CartItem[]) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      generateRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [cartItems]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const allRecommendations: Product[] = [];
      
      for (const item of cartItems) {
        const categoryRecommendations = await getRecommendationsByCategory(
          item.product.category_id || '',
          item.product.id,
          3
        );
        allRecommendations.push(...categoryRecommendations);
      }

      // Supprimer les doublons et limiter à 6 produits max
      const uniqueRecommendations = allRecommendations
        .filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )
        .slice(0, 6);

      setRecommendations(uniqueRecommendations);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationsByCategory = async (
    categoryId: string, 
    excludeProductId: string, 
    limit: number
  ): Promise<Product[]> => {
    if (!categoryId) return [];

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
      console.error('Erreur lors de la récupération des recommandations:', error);
      return [];
    }

    return (data || []).map(item => ({
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
    }));
  };

  return {
    recommendations,
    loading
  };
};
