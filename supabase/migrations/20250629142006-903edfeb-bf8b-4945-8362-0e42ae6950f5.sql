
-- Créer une fonction qui se déclenche automatiquement quand une commande est créée
CREATE OR REPLACE FUNCTION process_vendor_orders_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler la fonction Edge via pg_net
  PERFORM
    net.http_post(
      url := 'https://tyamdwmxqrmtearmqhhi.supabase.co/functions/v1/process-vendor-orders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YW1kd214cXJtdGVhcm1xaGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTYxNzYsImV4cCI6MjA2NjQ3MjE3Nn0.aCeT_Jj98YKPv5eIE-c0EYrlMF6mciOwaqiAqBGvzpU'
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger qui se déclenche après insertion d'une nouvelle commande
DROP TRIGGER IF EXISTS process_vendor_orders_on_insert ON public.orders;
CREATE TRIGGER process_vendor_orders_on_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION process_vendor_orders_trigger();

-- S'assurer que l'extension pg_net est activée pour les appels HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;
