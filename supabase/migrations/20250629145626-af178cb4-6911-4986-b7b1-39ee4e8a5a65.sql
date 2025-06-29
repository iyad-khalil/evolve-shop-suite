
-- Activer RLS sur vendor_orders si pas déjà fait
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques pour recommencer proprement
DROP POLICY IF EXISTS "vendor_orders_select_policy" ON public.vendor_orders;
DROP POLICY IF EXISTS "vendor_orders_update_policy" ON public.vendor_orders;
DROP POLICY IF EXISTS "vendor_orders_insert_policy" ON public.vendor_orders;
DROP POLICY IF EXISTS "Vendeurs lisent leurs commandes" ON public.vendor_orders;

-- Créer la politique de lecture pour les vendeurs
CREATE POLICY "Vendeurs lisent leurs commandes"
ON public.vendor_orders
FOR SELECT
USING (vendor_id = auth.uid());

-- Créer la politique de mise à jour pour les vendeurs
CREATE POLICY "Vendeurs modifient leurs commandes"
ON public.vendor_orders
FOR UPDATE
USING (vendor_id = auth.uid());

-- Politique d'insertion libre pour les fonctions Edge (service_role)
CREATE POLICY "Service role peut insérer"
ON public.vendor_orders
FOR INSERT
WITH CHECK (true);

-- S'assurer que la table est configurée pour Realtime
ALTER TABLE public.vendor_orders REPLICA IDENTITY FULL;

-- Vérifier si la table est déjà dans la publication realtime avant de l'ajouter
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
