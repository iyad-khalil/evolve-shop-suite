
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Vendors can view their own orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Vendors can update their own orders" ON public.vendor_orders;
DROP POLICY IF EXISTS "Edge functions can insert vendor orders" ON public.vendor_orders;

-- Créer des politiques plus robustes

-- Permettre aux vendeurs de voir leurs propres commandes
CREATE POLICY "vendors_select_own_orders" 
ON public.vendor_orders
FOR SELECT
USING (vendor_id = auth.uid());

-- Permettre aux vendeurs de mettre à jour leurs propres commandes
CREATE POLICY "vendors_update_own_orders" 
ON public.vendor_orders
FOR UPDATE
USING (vendor_id = auth.uid());

-- Permettre l'insertion pour les edge functions (bypass RLS avec service role)
CREATE POLICY "service_role_insert_vendor_orders" 
ON public.vendor_orders
FOR INSERT
WITH CHECK (true);

-- Permettre l'insertion pour les utilisateurs authentifiés (fallback)
CREATE POLICY "authenticated_insert_vendor_orders" 
ON public.vendor_orders
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- S'assurer que RLS est activé
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

-- Activer les mises à jour temps réel
ALTER TABLE public.vendor_orders REPLICA IDENTITY FULL;

-- S'assurer que la table est dans la publication realtime
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

-- Debug: Créer une vue pour vérifier les données
CREATE OR REPLACE VIEW vendor_orders_debug AS
SELECT 
    vo.id,
    vo.vendor_id,
    vo.order_id,
    vo.status,
    vo.subtotal,
    vo.created_at,
    o.customer_name,
    o.customer_email,
    p.name as product_names
FROM vendor_orders vo
JOIN orders o ON vo.order_id = o.id
LEFT JOIN products p ON p.vendor_id = vo.vendor_id;

-- Permettre l'accès à la vue de debug
GRANT SELECT ON vendor_orders_debug TO authenticated;
