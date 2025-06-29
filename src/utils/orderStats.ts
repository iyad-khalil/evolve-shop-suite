
import { VendorOrder, OrderStats } from '@/types/vendorOrder';

export const calculateOrderStats = (orders: VendorOrder[]): OrderStats => {
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.subtotal, 0)
  };
};
