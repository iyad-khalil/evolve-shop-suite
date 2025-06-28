
-- Insérer uniquement des produits électroniques dans la base de données
INSERT INTO public.products (
  vendor_id,
  category_id,
  name,
  description,
  price,
  original_price,
  stock,
  images,
  tags,
  is_active,
  rating,
  reviews_count
) VALUES
-- Smartphones
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'iPhone 15 Pro Max',
  'Le smartphone le plus avancé d''Apple avec puce A17 Pro, caméra 48MP ProRAW, écran Super Retina XDR de 6,7 pouces et boîtier en titane.',
  1299.00,
  1399.00,
  12,
  ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
  ARRAY['smartphone', 'apple', 'iPhone', '5G', 'pro'],
  true,
  4.8,
  247
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'Samsung Galaxy S24 Ultra',
  'Smartphone Android premium avec S Pen intégré, caméra 200MP, écran Dynamic AMOLED 2X de 6,8 pouces et processeur Snapdragon 8 Gen 3.',
  1199.00,
  1299.00,
  15,
  ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
  ARRAY['smartphone', 'samsung', 'galaxy', 'android', 'S-pen'],
  true,
  4.7,
  189
),
-- Ordinateurs portables
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'MacBook Pro 14" M3',
  'Ordinateur portable professionnel avec puce M3 Pro, écran Liquid Retina XDR 14,2", 18GB RAM et SSD 512GB. Parfait pour le développement et la création.',
  2199.00,
  2399.00,
  8,
  ARRAY['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
  ARRAY['laptop', 'apple', 'macbook', 'M3', 'pro'],
  true,
  4.9,
  156
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'Dell XPS 13 Plus',
  'Ultrabook premium avec processeur Intel Core i7 13ème gen, écran OLED 13,4", 16GB RAM et design sans bordures.',
  1599.00,
  1799.00,
  6,
  ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
  ARRAY['laptop', 'dell', 'xps', 'ultrabook', 'OLED'],
  true,
  4.6,
  92
),
-- Tablettes
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'iPad Pro 12.9" M2',
  'Tablette professionnelle avec puce M2, écran Liquid Retina XDR 12,9", compatible Apple Pencil et Magic Keyboard.',
  1099.00,
  1199.00,
  10,
  ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'],
  ARRAY['tablette', 'ipad', 'apple', 'M2', 'pro'],
  true,
  4.7,
  134
),
-- Écouteurs et audio
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'AirPods Pro 2ème génération',
  'Écouteurs sans fil avec réduction de bruit active adaptative, audio spatial personnalisé et boîtier de charge MagSafe.',
  279.00,
  299.00,
  25,
  ARRAY['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'],
  ARRAY['écouteurs', 'apple', 'airpods', 'bluetooth', 'pro'],
  true,
  4.8,
  312
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'Sony WH-1000XM5',
  'Casque audio premium avec réduction de bruit leader du marché, autonomie 30h et qualité sonore exceptionnelle.',
  399.00,
  449.00,
  18,
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
  ARRAY['casque', 'sony', 'bluetooth', 'noise-cancelling', 'premium'],
  true,
  4.6,
  203
),
-- Montres connectées
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'Apple Watch Series 9',
  'Montre connectée avec puce S9, écran Always-On Retina, suivi santé avancé et résistance à l''eau 50m.',
  459.00,
  499.00,
  20,
  ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500'],
  ARRAY['montre', 'apple', 'smartwatch', 'fitness', 'santé'],
  true,
  4.5,
  167
),
-- Accessoires
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Électronique'),
  'Chargeur MagSafe 15W',
  'Chargeur sans fil magnétique pour iPhone avec alignement parfait et charge rapide 15W.',
  45.00,
  NULL,
  35,
  ARRAY['https://images.unsplash.com/photo-1609592242717-421b67ee61f9?w=500'],
  ARRAY['chargeur', 'magsafe', 'apple', 'sans-fil', 'magnétique'],
  true,
  4.4,
  89
);
