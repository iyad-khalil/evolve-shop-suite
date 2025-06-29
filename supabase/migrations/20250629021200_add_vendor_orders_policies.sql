
-- Activer RLS sur vendor_orders si ce n'est pas déjà fait
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux vendeurs de voir leurs propres commandes
CREATE POLICY IF NOT EXISTS "Vendors can view their own orders" 
ON public.vendor_orders
FOR SELECT
USING (vendor_id = auth.uid());

-- Politique pour permettre aux vendeurs de mettre à jour leurs propres commandes
CREATE POLICY IF NOT EXISTS "Vendors can update their own orders" 
ON public.vendor_orders
FOR UPDATE
USING (vendor_id = auth.uid());

-- Politique pour permettre aux edge functions d'insérer des commandes vendeur
CREATE POLICY IF NOT EXISTS "Edge functions can insert vendor orders" 
ON public.vendor_orders
FOR INSERT
WITH CHECK (true);

-- Activer les mises à jour temps réel pour vendor_orders
ALTER TABLE public.vendor_orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_orders;
