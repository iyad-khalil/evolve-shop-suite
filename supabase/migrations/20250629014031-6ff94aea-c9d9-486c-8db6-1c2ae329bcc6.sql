
-- Créer une table pour les commandes spécifiques à chaque vendeur
CREATE TABLE IF NOT EXISTS public.vendor_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  shipping_carrier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter RLS pour que les vendeurs ne voient que leurs commandes
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own orders" 
  ON public.vendor_orders 
  FOR SELECT 
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own orders" 
  ON public.vendor_orders 
  FOR UPDATE 
  USING (vendor_id = auth.uid());

-- Créer une table pour l'historique des statuts
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_order_id UUID NOT NULL REFERENCES public.vendor_orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour l'historique
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their order history" 
  ON public.order_status_history 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.vendor_orders vo 
    WHERE vo.id = vendor_order_id AND vo.vendor_id = auth.uid()
  ));

CREATE POLICY "Vendors can insert their order history" 
  ON public.order_status_history 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vendor_orders vo 
    WHERE vo.id = vendor_order_id AND vo.vendor_id = auth.uid()
  ));

-- Trigger pour mettre à jour updated_at sur vendor_orders
CREATE TRIGGER update_vendor_orders_updated_at 
    BEFORE UPDATE ON public.vendor_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour enregistrer les changements de statut
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_history (vendor_order_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendor_order_status_change
    AFTER UPDATE ON public.vendor_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_status_change();

-- Activer les mises à jour en temps réel
ALTER TABLE public.vendor_orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_status_history REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
