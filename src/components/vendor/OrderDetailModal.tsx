
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, MapPin, Clock, User, Mail } from 'lucide-react';
import { VendorOrder, OrderStatusHistory, useVendorOrders } from '@/hooks/useVendorOrders';

interface OrderDetailModalProps {
  order: VendorOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const { updateOrderStatus, isUpdatingStatus, getOrderHistory } = useVendorOrders();
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setTrackingNumber(order.tracking_number || '');
      setShippingCarrier(order.shipping_carrier || '');
      setNotes(order.notes || '');
      
      // Charger l'historique
      getOrderHistory(order.id).then(setHistory).catch(console.error);
    }
  }, [order, getOrderHistory]);

  const handleUpdateOrder = () => {
    if (!order) return;

    updateOrderStatus({
      orderId: order.id,
      status: newStatus as VendorOrder['status'],
      trackingNumber: trackingNumber || undefined,
      shippingCarrier: shippingCarrier || undefined,
      notes: notes || undefined
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Commande #{order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{order.customer_email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm">
                    {order.shipping_address.street}<br />
                    {order.shipping_address.city}, {order.shipping_address.postalCode}<br />
                    {order.shipping_address.country}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestion du statut */}
          <Card>
            <CardHeader>
              <CardTitle>Gestion de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Statut actuel</label>
                <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium">Nouveau statut</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="processing">En traitement</SelectItem>
                    <SelectItem value="shipped">Expédiée</SelectItem>
                    <SelectItem value="delivered">Livrée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newStatus === 'shipped' || order.status === 'shipped') && (
                <>
                  <div>
                    <label className="text-sm font-medium">Transporteur</label>
                    <Select value={shippingCarrier} onValueChange={setShippingCarrier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un transporteur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colissimo">Colissimo</SelectItem>
                        <SelectItem value="chronopost">Chronopost</SelectItem>
                        <SelectItem value="dhl">DHL</SelectItem>
                        <SelectItem value="fedex">FedEx</SelectItem>
                        <SelectItem value="ups">UPS</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Numéro de suivi</label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Entrez le numéro de suivi"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium">Notes internes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes sur cette commande..."
                  className="min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleUpdateOrder}
                disabled={isUpdatingStatus}
                className="w-full"
              >
                {isUpdatingStatus ? 'Mise à jour...' : 'Mettre à jour la commande'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Produits commandés */}
        <Card>
          <CardHeader>
            <CardTitle>Produits commandés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Quantité: {item.quantity}
                      </p>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.price} €</p>
                    <p className="text-sm text-gray-600">
                      Total: {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-medium text-lg">
              <span>Total de votre part:</span>
              <span>{order.subtotal.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        {/* Historique des statuts */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historique des statuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      {entry.old_status && (
                        <span className="text-gray-600">
                          {getStatusLabel(entry.old_status)} → 
                        </span>
                      )}
                      <span className="font-medium ml-1">
                        {getStatusLabel(entry.new_status)}
                      </span>
                      {entry.notes && (
                        <p className="text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <span className="text-gray-500">
                      {new Date(entry.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
