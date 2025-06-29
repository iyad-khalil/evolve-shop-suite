
import { useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mlEngine } from '@/utils/mlRecommendations';

export const useMLRecommendations = (cartItems: CartItem[]) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMLReady, setIsMLReady] = useState(false);

  useEffect(() => {
    console.log('useMLRecommendations: Cart items changed:', cartItems);
    if (cartItems.length > 0) {
      generateMLRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [cartItems]);

  const generateMLRecommendations = async () => {
    console.log('useMLRecommendations: Starting ML recommendation generation');
    setLoading(true);
    
    try {
      // Récupérer tous les produits actifs pour l'analyse ML
      const { data: allProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .gt('stock', 0);

      if (error) {
        console.error('useMLRecommendations: Error fetching products:', error);
        return;
      }

      console.log('useMLRecommendations: Fetched', allProducts?.length, 'products for ML analysis');

      const formattedProducts: Product[] = (allProducts || []).map(item => ({
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

      // Mettre à jour la matrice de similarité si ce n'est pas déjà fait
      if (!isMLReady) {
        console.log('useMLRecommendations: Initializing ML engine');
        mlEngine.updateProductSimilarities(formattedProducts);
        setIsMLReady(true);
      }

      // Générer les recommandations ML
      const mlRecommendations = mlEngine.generateMLRecommendations(
        cartItems,
        formattedProducts,
        undefined, // userId - à implémenter avec l'auth
        6
      );

      console.log('useMLRecommendations: Generated', mlRecommendations.length, 'ML recommendations');
      setRecommendations(mlRecommendations);

      // Apprendre des comportements (ajouter au panier)
      cartItems.forEach(item => {
        mlEngine.learnFromBehavior({
          userId: 'anonymous', // À remplacer par le vrai userId
          productId: item.product.id,
          action: 'cart',
          timestamp: new Date()
        });
      });

    } catch (error) {
      console.error('useMLRecommendations: Error in ML recommendation generation:', error);
      
      // Fallback vers les recommandations simples en cas d'erreur
      await generateFallbackRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackRecommendations = async () => {
    console.log('useMLRecommendations: Using fallback recommendations');
    
    const allRecommendations: Product[] = [];
    
    for (const item of cartItems) {
      if (item.product.category_id) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .eq('category_id', item.product.category_id)
          .eq('is_active', true)
          .neq('id', item.product.id)
          .gt('stock', 0)
          .order('rating', { ascending: false })
          .limit(3);

        if (!error && data) {
          const fallbackProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            originalPrice: product.original_price,
            image: product.images?.[0] || '/placeholder.svg',
            images: product.images || [],
            category: product.categories?.name || 'Non catégorisé',
            category_id: product.category_id,
            stock: product.stock,
            rating: product.rating || 0,
            reviews: product.reviews_count || 0,
            tags: product.tags || [],
            createdAt: new Date(product.created_at),
            updatedAt: new Date(product.updated_at),
          }));
          
          allRecommendations.push(...fallbackProducts);
        }
      }
    }

    // Supprimer les doublons
    const uniqueRecommendations = allRecommendations
      .filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )
      .slice(0, 6);

    setRecommendations(uniqueRecommendations);
  };

  return {
    recommendations,
    loading,
    isMLReady
  };
};
