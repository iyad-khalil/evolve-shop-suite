
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

  // Récupérer toutes les commandes du vendeur (SANS données statiques)
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['vendor-orders', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('❌ No user authenticated');
        return [];
      }
      
      console.log('🔍 Fetching vendor orders for user:', user.id);
      
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
        throw error;
      }

      console.log('✅ Vendor orders fetched:', data?.length || 0);
      
      if (!data || data.length === 0) {
        return [];
      }

      return data.map(order => ({
        ...order,
        customer_name: order.orders.customer_name,
        customer_email: order.orders.customer_email,
        shipping_address: order.orders.shipping_address
      })) as VendorOrder[];
    },
    enabled: !!user
  });

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
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Nouvelle commande !",
              description: "Une nouvelle commande vient d'arriver",
            });
          }
        }
      )
      .subscribe();

    setRealTimeChannel(channel);

    return () => {
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

  return {
    orders,
    isLoading,
    orderStats,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
    getOrderHistory
  };
};
