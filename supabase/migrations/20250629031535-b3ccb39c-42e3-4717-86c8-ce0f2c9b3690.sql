
-- Supprimer tous les clients en plus des vendeurs
DELETE FROM profiles WHERE role = 'customer';

-- Supprimer toutes les commandes (au cas où il en resterait)
DELETE FROM orders;
