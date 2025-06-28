
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShippingAddress } from '@/types/order';
import { ArrowLeft, CreditCard, Truck } from 'lucide-react';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, total } = useCart();
  const { user } = useAuth();
  const { createOrder, isCreatingOrder } = useOrders();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'France'
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  // Rediriger si le panier est vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Ajoutez des produits à votre panier avant de passer commande.
            </p>
            <Button onClick={() => navigate('/products')}>
              Voir les produits
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!shippingAddress.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!shippingAddress.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'L\'email est requis';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }
    if (!shippingAddress.street.trim()) {
      newErrors.street = 'L\'adresse est requise';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'La ville est requise';
    }
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const orderId = await createOrder(shippingAddress);
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      // L'erreur est gérée dans le hook
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au panier
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Finaliser la commande
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de livraison */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="street">Adresse *</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className={errors.street ? 'border-red-500' : ''}
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={errors.postalCode ? 'border-red-500' : ''}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Récapitulatif de commande */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant?.id || 'default'}`} className="flex items-center space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {((item.variant?.price || item.product.price)).toLocaleString()} €
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{total.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{total.toLocaleString()} €</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                  disabled={isCreatingOrder}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isCreatingOrder ? 'Traitement...' : 'Confirmer la commande'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  En confirmant votre commande, vous acceptez nos conditions générales de vente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
