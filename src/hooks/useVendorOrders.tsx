
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VendorOrder {
  id: string;
  vendor_id: string;
  order_id: string;
  items: any[];
  subtotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  shipping_carrier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Données de la commande principale
  customer_name: string;
  customer_email: string;
  shipping_address: any;
}

export interface OrderStatusHistory {
  id: string;
  vendor_order_id: string;
  old_status?: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export const useVendorOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [realTimeChannel, setRealTimeChannel] = useState<any>(null);

  // 🔍 DEBUG SECTION - Vérifications d'authentification
  useEffect(() => {
    console.log('🔐 === DEBUG AUTHENTICATION ===');
    console.log('🔐 User object:', user);
    console.log('🔐 User ID:', user?.id);
    console.log('🔐 User email:', user?.email);
    console.log('🔐 User authenticated:', !!user);
    
    // Test de la session Supabase
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔐 Supabase session:', session);
        console.log('🔐 Session error:', sessionError);
        console.log('🔐 Session user ID:', session?.user?.id);
        console.log('🔐 Session access token present:', !!session?.access_token);
        
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        console.log('🔐 Supabase auth user:', authUser);
        console.log('🔐 User error:', userError);
      } catch (error) {
        console.error('🔐 Auth check error:', error);
      }
    };
    
    if (user) {
      checkAuth();
    }
  }, [user]);

  // Récupérer toutes les commandes du vendeur
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['vendor-orders', user?.id] as const,
    queryFn: async () => {
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

  // Log des erreurs de requête
  useEffect(() => {
    if (error) {
      console.error('🚨 === QUERY ERROR DETAILS ===');
      console.error('🚨 Error object:', error);
      console.error('🚨 Error message:', error.message);
      console.error('🚨 Error stack:', error.stack);
      toast({
        title: "Erreur de chargement",
        description: `Impossible de charger les commandes vendeur: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Log des données chargées
  useEffect(() => {
    console.log('📊 === DATA UPDATE ===');
    console.log('📊 Orders state updated:', orders.length, 'orders');
    console.log('📊 Loading state:', isLoading);
    console.log('📊 Error state:', !!error);
  }, [orders, isLoading, error]);

  // Récupérer l'historique des statuts pour une commande
  const getOrderHistory = async (vendorOrderId: string): Promise<OrderStatusHistory[]> => {
    console.log('📜 Getting order history for:', vendorOrderId);
    
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('vendor_order_id', vendorOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching order history:', error);
      throw error;
    }

    console.log('✅ Order history retrieved:', data?.length || 0, 'entries');
    return data as OrderStatusHistory[];
  };

  // Mutation pour mettre à jour le statut d'une commande
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      trackingNumber, 
      shippingCarrier, 
      notes 
    }: {
      orderId: string;
      status: VendorOrder['status'];
      trackingNumber?: string;
      shippingCarrier?: string;
      notes?: string;
    }) => {
      console.log('🔄 Updating order status:', { orderId, status, trackingNumber, shippingCarrier, notes });
      
      const updateData: any = { status };
      
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
      if (shippingCarrier !== undefined) updateData.shipping_carrier = shippingCarrier;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('vendor_orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('vendor_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Update order error:', error);
        throw error;
      }
      
      console.log('✅ Order updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Order update success:', data);
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', user?.id] as const });
      toast({
        title: "Commande mise à jour",
        description: `Le statut a été changé vers "${data.status}"`,
      });
    },
    onError: (error) => {
      console.error('❌ Order update error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
    }
  });

  // Configuration des mises à jour en temps réel
  useEffect(() => {
    if (!user) {
      console.log('🔌 No user, skipping realtime setup');
      return;
    }

    console.log('🔄 === REALTIME SETUP ===');
    console.log('🔄 Setting up real-time channel for vendor:', user.id);

    const channel = supabase
      .channel('vendor-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_orders',
          filter: `vendor_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 === REALTIME UPDATE ===');
          console.log('🔔 Real-time update received:', payload);
          console.log('🔔 Event type:', payload.eventType);
          console.log('🔔 New record:', payload.new);
          console.log('🔔 Old record:', payload.old);
          
          queryClient.invalidateQueries({ queryKey: ['vendor-orders', user.id] as const });
          
          if (payload.eventType === 'INSERT') {
            console.log('🎉 New vendor order received via realtime!');
            toast({
              title: "Nouvelle commande !",
              description: "Une nouvelle commande vient d'arriver",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 === REALTIME STATUS ===');
        console.log('📡 Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime successfully connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Realtime connection timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Realtime connection closed');
        }
      });

    setRealTimeChannel(channel);

    return () => {
      console.log('🔌 === REALTIME CLEANUP ===');
      console.log('🔌 Cleaning up real-time channel');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, queryClient, toast]);

  // Statistiques des commandes
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.subtotal, 0)
  };

  // Debug summary final
  useEffect(() => {
    if (user) {
      console.log('📊 === FINAL DEBUG SUMMARY ===');
      console.log('📊 User ID:', user.id);
      console.log('📊 User email:', user.email);
      console.log('📊 Orders loaded:', orders.length);
      console.log('📊 Is loading:', isLoading);
      console.log('📊 Has error:', !!error);
      console.log('📊 Error details:', error);
      console.log('📊 Order stats:', orderStats);
      console.log('📊 Realtime channel:', realTimeChannel ? 'Connected' : 'Not connected');
      
      if (orders.length === 0 && !isLoading && !error) {
        console.log('⚠️ === ZERO ORDERS ANALYSIS ===');
        console.log('⚠️ No orders found despite successful query');
        console.log('⚠️ This suggests either:');
        console.log('⚠️   - No vendor_orders exist for this vendor_id');
        console.log('⚠️   - RLS is blocking access (auth issue)');
        console.log('⚠️   - The process-vendor-orders function never ran');
        console.log('⚠️   - The vendor_id in orders doesn\'t match user.id');
      }
    }
  }, [user, orders, isLoading, error, orderStats, realTimeChannel]);

  return {
    orders,
    isLoading,
    error,
    orderStats,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
    getOrderHistory
  };
};
