
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [customerForm, setCustomerForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const [vendorForm, setVendorForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    businessName: '',
    businessDescription: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        toast.error('Erreur de connexion', {
          description: error.message
        });
      } else {
        toast.success('Connexion réussie !');
        navigate('/');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (customerForm.password !== customerForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(customerForm.email, customerForm.password, {
        first_name: customerForm.firstName,
        last_name: customerForm.lastName,
        role: 'customer'
      });

      if (error) {
        toast.error('Erreur lors de l\'inscription', {
          description: error.message
        });
      } else {
        toast.success('Compte client créé avec succès !', {
          description: 'Vérifiez votre email pour confirmer votre compte.'
        });
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (vendorForm.password !== vendorForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(vendorForm.email, vendorForm.password, {
        first_name: vendorForm.firstName,
        last_name: vendorForm.lastName,
        role: 'vendor',
        business_name: vendorForm.businessName
      });

      if (error) {
        toast.error('Erreur lors de l\'inscription', {
          description: error.message
        });
      } else {
        toast.success('Compte vendeur créé avec succès !', {
          description: 'Vérifiez votre email pour confirmer votre compte.'
        });
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au site
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EC</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">EcommerceAI</h2>
          <p className="text-gray-600 mt-2">Votre marketplace multi-vendeurs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connexion / Inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="customer">Client</TabsTrigger>
                <TabsTrigger value="vendor">Vendeur</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4">
                <form onSubmit={handleCustomerSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-firstname">Prénom</Label>
                      <Input
                        id="customer-firstname"
                        value={customerForm.firstName}
                        onChange={(e) => setCustomerForm({...customerForm, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-lastname">Nom</Label>
                      <Input
                        id="customer-lastname"
                        value={customerForm.lastName}
                        onChange={(e) => setCustomerForm({...customerForm, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-password">Mot de passe</Label>
                    <Input
                      id="customer-password"
                      type="password"
                      value={customerForm.password}
                      onChange={(e) => setCustomerForm({...customerForm, password: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-confirm">Confirmer le mot de passe</Label>
                    <Input
                      id="customer-confirm"
                      type="password"
                      value={customerForm.confirmPassword}
                      onChange={(e) => setCustomerForm({...customerForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Créer un compte client
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="vendor" className="space-y-4">
                <form onSubmit={handleVendorSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor-firstname">Prénom</Label>
                      <Input
                        id="vendor-firstname"
                        value={vendorForm.firstName}
                        onChange={(e) => setVendorForm({...vendorForm, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendor-lastname">Nom</Label>
                      <Input
                        id="vendor-lastname"
                        value={vendorForm.lastName}
                        onChange={(e) => setVendorForm({...vendorForm, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vendor-email">Email</Label>
                    <Input
                      id="vendor-email"
                      type="email"
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-business">Nom de l'entreprise</Label>
                    <Input
                      id="vendor-business"
                      value={vendorForm.businessName}
                      onChange={(e) => setVendorForm({...vendorForm, businessName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-description">Description de l'entreprise</Label>
                    <Textarea
                      id="vendor-description"
                      value={vendorForm.businessDescription}
                      onChange={(e) => setVendorForm({...vendorForm, businessDescription: e.target.value})}
                      placeholder="Décrivez votre activité..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-password">Mot de passe</Label>
                    <Input
                      id="vendor-password"
                      type="password"
                      value={vendorForm.password}
                      onChange={(e) => setVendorForm({...vendorForm, password: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor-confirm">Confirmer le mot de passe</Label>
                    <Input
                      id="vendor-confirm"
                      type="password"
                      value={vendorForm.confirmPassword}
                      onChange={(e) => setVendorForm({...vendorForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Créer un compte vendeur
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
