import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Home, AlertCircle } from 'lucide-react';
import { Order } from '@/types/order';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { verifyPayment } = useOrders();
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  const paymentStatus = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');

  // Vérifier le paiement si on vient de Stripe, mais seulement une fois
  useEffect(() => {
    if (paymentStatus === 'success' && sessionId && !paymentVerified) {
      console.log('🔄 Verifying payment for session:', sessionId);
      setPaymentVerified(true);
      verifyPayment(sessionId);
    }
  }, [paymentStatus, sessionId, verifyPayment, paymentVerified]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId || !user) return null;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('customer_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      return {
        id: data.id,
        customerId: data.customer_id,
        customerEmail: (data as any).customer_email || '',
        customerName: (data as any).customer_name || '',
        items: (data as any).items || [],
        totalAmount: Number(data.total_amount),
        shippingAddress: data.shipping_address as unknown as Order['shippingAddress'],
        status: data.status as Order['status'],
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || ''
      } as Order;
    },
    enabled: !!orderId && !!user
  });

  const isPaymentSuccessful = paymentStatus === 'success' || order?.status === 'confirmed';
  const isPaymentPending = order?.status === 'payment_pending';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Commande introuvable
            </h2>
            <p className="text-gray-600 mb-8">
              Cette commande n'existe pas ou vous n'avez pas l'autorisation de la voir.
            </p>
            <Link to="/products">
              <Button>Retour aux produits</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de confirmation */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {isPaymentSuccessful ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : isPaymentPending ? (
              <AlertCircle className="w-16 h-16 text-orange-500" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPaymentSuccessful ? 'Commande confirmée !' : 
             isPaymentPending ? 'Paiement en attente' : 
             'Commande créée'}
          </h1>
          <p className="text-lg text-gray-600">
            {isPaymentSuccessful ? `Merci pour votre commande #${order.id.slice(0, 8)}` :
             isPaymentPending ? `Commande #${order.id.slice(0, 8)} - En attente de paiement` :
             `Commande #${order.id.slice(0, 8)} créée`}
          </p>
          <p className="text-sm text-gray-500">
            Commandée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          
          {/* Statut du paiement */}
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isPaymentSuccessful ? 'bg-green-100 text-green-800' :
              isPaymentPending ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {isPaymentSuccessful ? '✅ Paiement confirmé' :
               isPaymentPending ? '⏳ Paiement en attente' :
               '📝 Commande créée'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Détails de la commande */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Articles commandés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.productName}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-500">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {(item.price * item.quantity).toLocaleString()} €
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.price.toLocaleString()} € / unité
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-semibold">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.postalCode} {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2">
                    <span className="font-medium">Email:</span> {order.shippingAddress.email}
                  </p>
                  <p>
                    <span className="font-medium">Téléphone:</span> {order.shippingAddress.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Récapitulatif */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{order.totalAmount.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{order.totalAmount.toLocaleString()} €</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Link to="/products" className="block">
                    <Button className="w-full">
                      <Package className="w-4 h-4 mr-2" />
                      Continuer mes achats
                    </Button>
                  </Link>
                  <Link to="/" className="block">
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Retour à l'accueil
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 text-xs text-gray-500">
                  <p className="font-medium mb-2">
                    {isPaymentSuccessful ? 'Prochaines étapes :' : 'Information :'}
                  </p>
                  <ul className="space-y-1">
                    {isPaymentSuccessful ? (
                      <>
                        <li>• Confirmation par email</li>
                        <li>• Préparation de votre commande</li>
                        <li>• Expédition sous 2-3 jours ouvrés</li>
                        <li>• Livraison à domicile</li>
                      </>
                    ) : isPaymentPending ? (
                      <>
                        <li>• Paiement en cours de vérification</li>
                        <li>• Vous recevrez une confirmation</li>
                        <li>• La commande sera traitée après paiement</li>
                      </>
                    ) : (
                      <>
                        <li>• Commande créée avec succès</li>
                        <li>• Procédez au paiement pour confirmer</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
