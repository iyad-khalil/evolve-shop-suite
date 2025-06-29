
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VendorOrder } from '@/types/vendorOrder';

export const useVendorOrdersQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor-orders', user?.id] as const,
    queryFn: async (): Promise<VendorOrder[]> => {
      console.log('🚀 === DEBUG QUERY EXECUTION ===');
      console.log('🚀 Starting vendor orders query');
      console.log('🚀 Query key:', ['vendor-orders', user?.id]);
      
      if (!user) {
        console.log('❌ No user authenticated for vendor orders');
        console.log('❌ Returning empty array');
        return [];
      }
      
      console.log('🔍 User authenticated, proceeding with query');
      console.log('🔍 User ID:', user.id);
      console.log('🔍 User email:', user.email);
      
      // Test des produits du vendeur d'abord
      console.log('📦 === TESTING VENDOR PRODUCTS ===');
      try {
        const { data: vendorProducts, error: productsError } = await supabase
          .from('products')
          .select('id, name, vendor_id')
          .eq('vendor_id', user.id);

        console.log('📦 Products query result:', { vendorProducts, productsError });
        console.log('📦 Vendor products count:', vendorProducts?.length || 0);
        
        if (productsError) {
          console.error('❌ Error fetching vendor products:', productsError);
        } else if (vendorProducts && vendorProducts.length > 0) {
          console.log('✅ Vendor products found:');
          vendorProducts.forEach(p => {
            console.log(`   - Product: ${p.name} (ID: ${p.id}, Vendor: ${p.vendor_id})`);
          });
        } else {
          console.log('⚠️ No products found for this vendor');
        }
      } catch (error) {
        console.error('💥 Exception in products query:', error);
      }

      // Test de la requête vendor_orders de base
      console.log('🛍️ === TESTING BASIC VENDOR_ORDERS QUERY ===');
      try {
        const { data: basicOrders, error: basicError } = await supabase
          .from('vendor_orders')
          .select('*')
          .eq('vendor_id', user.id);

        console.log('🛍️ Basic vendor_orders query result:', { basicOrders, basicError });
        console.log('🛍️ Basic orders count:', basicOrders?.length || 0);
        
        if (basicError) {
          console.error('❌ Basic vendor_orders error:', basicError);
          console.error('❌ Error details:', JSON.stringify(basicError, null, 2));
        } else if (basicOrders && basicOrders.length > 0) {
          console.log('✅ Basic vendor orders found:');
          basicOrders.forEach(o => {
            console.log(`   - Order: ${o.id} (Vendor: ${o.vendor_id}, Status: ${o.status}, Subtotal: ${o.subtotal})`);
          });
        } else {
          console.log('⚠️ No basic vendor orders found');
        }
      } catch (error) {
        console.error('💥 Exception in basic vendor_orders query:', error);
      }

      // NOUVELLE APPROCHE - Récupérer vendor_orders puis orders séparément
      console.log('🎯 === NEW APPROACH: SEPARATE QUERIES ===');
      
      // 1. Récupérer les vendor_orders
      const { data: vendorOrders, error: vendorError } = await supabase
        .from('vendor_orders')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (vendorError) {
        console.error('❌ Vendor orders error:', vendorError);
        throw vendorError;
      }

      console.log('✅ Vendor orders retrieved:', vendorOrders?.length || 0);
      
      if (!vendorOrders || vendorOrders.length === 0) {
        console.log('📝 No vendor orders found, returning empty array');
        return [];
      }

      // 2. Récupérer les order_ids uniques
      const orderIds = [...new Set(vendorOrders.map(vo => vo.order_id))];
      console.log('🔍 Unique order IDs to fetch:', orderIds);

      // 3. Récupérer les données des commandes principales
      const { data: mainOrders, error: mainOrdersError } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, shipping_address')
        .in('id', orderIds);

      if (mainOrdersError) {
        console.error('❌ Main orders error:', mainOrdersError);
        console.error('❌ Will proceed without customer data');
      }

      console.log('✅ Main orders retrieved:', mainOrders?.length || 0);

      // 4. Combiner les données
      const formattedOrders: VendorOrder[] = vendorOrders.map(vendorOrder => {
        const mainOrder = mainOrders?.find(mo => mo.id === vendorOrder.order_id);
        
        return {
          ...vendorOrder,
          items: Array.isArray(vendorOrder.items) ? vendorOrder.items : [],
          customer_name: mainOrder?.customer_name || 'Client inconnu',
          customer_email: mainOrder?.customer_email || 'email@inconnu.com',
          shipping_address: mainOrder?.shipping_address || {}
        };
      });

      console.log('✅ === FINAL SUCCESS ===');
      console.log('✅ Formatted vendor orders:', formattedOrders.length);
      formattedOrders.forEach(order => {
        console.log(`✅ Order ${order.id}: ${order.customer_name} - ${order.subtotal}€ (${order.status})`);
      });
      
      return formattedOrders;
    },
    enabled: !!user,
    refetchInterval: 30000,
    retry: (failureCount, error) => {
      console.log(`🔄 Query retry attempt ${failureCount}:`, error);
      return failureCount < 3;
    },
    retryDelay: attemptIndex => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`⏱️ Retry delay: ${delay}ms`);
      return delay;
    },
  });
};
