
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

  // Récupérer toutes les commandes du vendeur
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['vendor-orders', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('❌ No user authenticated for vendor orders');
        return [];
      }
      
      console.log('🔍 Fetching vendor orders for user:', user.id);
      console.log('📧 User email:', user.email);
      
      // D'abord vérifier les produits du vendeur pour debugging
      const { data: vendorProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, vendor_id')
        .eq('vendor_id', user.id);

      if (productsError) {
        console.error('❌ Error fetching vendor products:', productsError);
      } else {
        console.log('📦 Vendor products found:', vendorProducts?.length || 0);
        vendorProducts?.forEach(p => {
          console.log(`- Product: ${p.name} (ID: ${p.id}, Vendor: ${p.vendor_id})`);
        });
      }
      
      const { data, error } = await supabase
        .from('vendor_orders')
        .select(`
          *,
          orders!inner(
            customer_name,
            customer_email,
            shipping_address
          )
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching vendor orders:', error);
        console.error('❌ Full error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Raw vendor orders data:', data);
      console.log('📊 Vendor orders count:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log('📝 No vendor orders found. This could mean:');
        console.log('   1. No orders have been placed yet');
        console.log('   2. The process-vendor-orders function failed');
        console.log('   3. RLS policies are blocking access');
        console.log('   4. Products don\'t have the correct vendor_id');
        return [];
      }

      const formattedOrders = data.map(order => ({
        ...order,
        customer_name: order.orders.customer_name,
        customer_email: order.orders.customer_email,
        shipping_address: order.orders.shipping_address
      })) as VendorOrder[];

      console.log('✅ Formatted vendor orders:', formattedOrders.length);
      formattedOrders.forEach(order => {
        console.log(`- Order ${order.id}: ${order.customer_name} - ${order.subtotal}€ (${order.status})`);
      });
      
      return formattedOrders;
    },
    enabled: !!user,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Log des erreurs de requête
  useEffect(() => {
    if (error) {
      console.error('🚨 Vendor orders query error:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les commandes vendeur",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Récupérer l'historique des statuts pour une commande
  const getOrderHistory = async (vendorOrderId: string): Promise<OrderStatusHistory[]> => {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('vendor_order_id', vendorOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }

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

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      toast({
        title: "Commande mise à jour",
        description: `Le statut a été changé vers "${data.status}"`,
      });
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
    }
  });

  // Configuration des mises à jour en temps réel
  useEffect(() => {
    if (!user) return;

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
          console.log('🔔 Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
          
          if (payload.eventType === 'INSERT') {
            console.log('🎉 New vendor order received!');
            toast({
              title: "Nouvelle commande !",
              description: "Une nouvelle commande vient d'arriver",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    setRealTimeChannel(channel);

    return () => {
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

  // Debug info
  useEffect(() => {
    if (user) {
      console.log('📊 Vendor Orders Debug Summary:');
      console.log('- User ID:', user.id);
      console.log('- Orders loaded:', orders.length);
      console.log('- Is loading:', isLoading);
      console.log('- Has error:', !!error);
      if (error) {
        console.log('- Error details:', error);
      }
    }
  }, [user, orders, isLoading, error]);

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
