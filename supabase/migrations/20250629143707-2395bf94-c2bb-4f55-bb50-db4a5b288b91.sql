
-- Corriger les politiques RLS pour vendor_orders
-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "vendors_select_own_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "vendors_update_own_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "service_role_insert_vendor_orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "authenticated_insert_vendor_orders" ON public.vendor_orders;

-- Créer des politiques RLS plus permissives pour les vendor_orders
CREATE POLICY "vendor_orders_select_policy" 
ON public.vendor_orders
FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "vendor_orders_update_policy" 
ON public.vendor_orders
FOR UPDATE
USING (vendor_id = auth.uid());

-- Politique pour permettre l'insertion par les edge functions (sans restriction RLS)
CREATE POLICY "vendor_orders_insert_policy" 
ON public.vendor_orders
FOR INSERT
WITH CHECK (true);

-- S'assurer que la table est bien dans la publication realtime
ALTER TABLE public.vendor_orders REPLICA IDENTITY FULL;

-- Ajouter à la publication realtime si pas déjà fait
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'vendor_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_orders;
    END IF;
END $$;
