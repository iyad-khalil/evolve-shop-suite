
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import { toast } from 'sonner';

export const useVendorProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('vendor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Erreur lors du chargement des produits');
        return;
      }

      const formattedProducts: Product[] = (data || []).map(item => ({
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
        vendor_id: item.vendor_id,
        is_active: item.is_active
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('vendor_id', user?.id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Erreur lors de la suppression du produit');
        return;
      }

      toast.success('Produit supprimé avec succès');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  return {
    products,
    loading,
    handleDeleteProduct,
    fetchProducts
  };
};
