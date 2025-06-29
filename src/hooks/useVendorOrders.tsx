
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useVendorOrdersQuery } from './useVendorOrdersQuery';
import { useVendorOrdersRealtime } from './useVendorOrdersRealtime';
import { useVendorOrdersMutations } from './useVendorOrdersMutations';
import { calculateOrderStats } from '@/utils/orderStats';

export const useVendorOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the separate hooks
  const { data: orders = [], isLoading, error } = useVendorOrdersQuery();
  const { realTimeChannel } = useVendorOrdersRealtime();
  const { updateOrderStatus, isUpdatingStatus, getOrderHistory } = useVendorOrdersMutations();

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
        const { supabase } = await import('@/integrations/supabase/client');
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

  // Statistiques des commandes
  const orderStats = calculateOrderStats(orders);

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
    updateOrderStatus,
    isUpdatingStatus,
    getOrderHistory
  };
};

// Re-export the types for convenience
export type { VendorOrder, OrderStatusHistory } from '@/types/vendorOrder';
