
import React from 'react';
import { Package, ShoppingCart, TrendingUp, Users, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { useVendorOrders } from '@/hooks/useVendorOrders';

export const VendorDashboard: React.FC = () => {
  const { products, loading: productsLoading } = useVendorProducts();
  const { orders, orderStats, isLoading: ordersLoading } = useVendorOrders();

  const totalProducts = products.length;
  const totalOrders = orderStats.total;
  const totalRevenue = orderStats.totalRevenue;
  const pendingOrders = orderStats.pending;

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter(product => product.stock < 10).slice(0, 5);

  if (productsLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">
            Bienvenue dans votre espace vendeur
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/vendor/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Voir le site
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {totalProducts === 0 ? 'Aucun produit ajouté' : 'Produits en ligne'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders > 0 ? `${pendingOrders} en attente` : 'Aucune commande en attente'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              Revenus totaux
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Commandes reçues
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.subtotal.toLocaleString()} €</p>
                      <p className={`text-sm px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                        order.status === 'shipped' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status === 'pending' ? 'En attente' :
                         order.status === 'processing' ? 'En cours' :
                         order.status === 'shipped' ? 'Expédiée' :
                         order.status}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <Link to="/vendor/orders">
                    <Button variant="outline" className="w-full">
                      Voir toutes les commandes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Aucune commande pour le moment</p>
                <Link to="/vendor/products/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un produit
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Stock faible</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">{product.stock} restant{product.stock > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <Link to="/vendor/products">
                    <Button variant="outline" className="w-full">
                      Gérer les stocks
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {totalProducts === 0 ? 'Aucun produit à surveiller' : 'Tous vos produits ont un stock suffisant'}
                </p>
                {totalProducts === 0 && (
                  <Link to="/vendor/products/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
