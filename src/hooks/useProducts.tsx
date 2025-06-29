import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';

export const useProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log('useProducts: Starting to fetch data');
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log('useProducts: Dependencies changed, refetching products');
    fetchProducts();
  }, [selectedCategory, searchTerm, sortBy]);

  const fetchCategories = async () => {
    try {
      console.log('useProducts: Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('useProducts: Error fetching categories:', error);
        return;
      }

      console.log('useProducts: Categories fetched successfully:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('useProducts: Exception in fetchCategories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('useProducts: Fetching products...');
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true);

      if (selectedCategory && selectedCategory !== 'all') {
        console.log('useProducts: Filtering by category:', selectedCategory);
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        console.log('useProducts: Filtering by search term:', searchTerm);
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Sorting
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      console.log('useProducts: Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('useProducts: Error fetching products:', error);
        return;
      }

      console.log('useProducts: Products fetched from database:', data);

      const formattedProducts: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        originalPrice: item.original_price,
        image: item.images?.[0] || '/placeholder.svg',
        images: item.images || [],
        category: item.categories?.name || 'Non catégorisé',
        category_id: item.category_id, // S'assurer que category_id est bien passé
        stock: item.stock,
        rating: item.rating || 0,
        reviews: item.reviews_count || 0,
        tags: item.tags || [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      console.log('useProducts: Formatted products:', formattedProducts);

      // Filter by price range
      const filteredProducts = formattedProducts.filter(
        product => product.price >= priceRange[0] && product.price <= priceRange[1]
      );

      console.log('useProducts: Final filtered products:', filteredProducts);
      setProducts(filteredProducts);
    } catch (error) {
      console.error('useProducts: Exception in fetchProducts:', error);
    } finally {
      console.log('useProducts: Setting loading to false');
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 5000]);
    setSortBy('name');
    setSearchParams(new URLSearchParams());
  };

  return {
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
  };
};
