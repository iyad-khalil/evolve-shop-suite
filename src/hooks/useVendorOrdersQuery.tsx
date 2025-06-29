
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

      // 4. Combiner les données avec le type casting approprié
      const formattedOrders: VendorOrder[] = vendorOrders.map(vendorOrder => {
        const mainOrder = mainOrders?.find(mo => mo.id === vendorOrder.order_id);
        
        return {
          ...vendorOrder,
          // Type casting pour s'assurer que le statut correspond à notre type
          status: vendorOrder.status as VendorOrder['status'],
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
