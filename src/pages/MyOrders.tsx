import React from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MyOrders = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Vous devez être connecté pour voir vos commandes.</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'payment_pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'payment_pending':
        return 'Paiement en attente';
      case 'confirmed':
        return 'Confirmée';
      case 'processing':
        return 'En préparation';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const generateReceipt = (order: any) => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Reçu - Commande ${order.id.slice(0, 8)}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .order-info { margin-bottom: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total { font-size: 18px; font-weight: bold; text-align: right; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>EcommerceAI</h1>
              <h2>Reçu de paiement</h2>
            </div>
            
            <div class="order-info">
              <p><strong>Numéro de commande:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
              <p><strong>Client:</strong> ${order.customerName}</p>
              <p><strong>Email:</strong> ${order.customerEmail}</p>
              <p><strong>Statut:</strong> ${getStatusText(order.status)}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item: any) => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)} €</td>
                    <td>${(item.price * item.quantity).toFixed(2)} €</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total">
              <p>Total: ${order.totalAmount.toFixed(2)} €</p>
            </div>

            <div class="footer">
              <p>Merci pour votre achat !</p>
              <p>EcommerceAI - Votre marketplace de confiance</p>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes commandes</h1>
        <p className="text-gray-600">Retrouvez l'historique de toutes vos commandes</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
            <p className="text-gray-600 mb-4">Vous n'avez pas encore passé de commande.</p>
            <Button asChild>
              <a href="/products">Découvrir nos produits</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Commande #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Passée le {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </Badge>
                    {(order.status === 'delivered' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateReceipt(order)}
                        className="flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4" />
                        Reçu
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Articles */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Articles commandés</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.productImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                              alt={item.productName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{(item.price * item.quantity).toFixed(2)} €</p>
                            <p className="text-sm text-gray-600">{item.price.toFixed(2)} € × {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Adresse de livraison */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Adresse de livraison</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">{order.totalAmount.toFixed(2)} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
