-- Populate menu_items with the complete menu
INSERT INTO menu_items (category, name, description, price, image_url) VALUES
-- Breakfast items
('breakfast', 'Clifton''s Big Breakfast', 'Two sausages, two bacon, egg, beans, tomato, hash brown, mushrooms, toast', 8.99, '/images/cliftons-big-breakfast.png'),
('breakfast', 'Clifton''s Small Breakfast', 'One sausage, one bacon, egg, beans, tomato, toast', 6.99, '/images/cliftons-small-breakfast.png'),
('breakfast', 'Bacon Bap', 'Crispy bacon in soft white bap', 3.50, '/images/bacon-bap-retry.png'),
('breakfast', 'Sausage Bap', 'Juicy sausage in toasted bap', 3.50, '/images/sausage-bap.png'),
('breakfast', 'Bacon & Sausage Bap', 'Both in one bap', 4.00, '/images/bacon-sausage-bap.png'),
('breakfast', 'Bacon, Sausage & Egg Bap', 'Loaded bap with fried egg', 4.50, '/images/bacon-sausage-egg-bap.png'),

-- Breakfast extras
('extras', 'Breakfast Extras', 'Bacon, Sausage, Black Pudding, Fried Slice, Mushrooms, Hash Brown, Potatoes, Egg, Beans, Tomatoes (£0.50-£1.00 each)', 0.75, '/images/breakfast-sides.png'),

-- Lunch items
('lunch', 'Jacket Potato', 'With salad, coleslaw, 2 toppings', 6.75, '/images/jacket-potato.png'),
('lunch', 'Panini', 'Choice: Brie & bacon, ham & tomato, or cheese & onion', 4.95, '/images/panini-grilled.png'),
('lunch', 'Toastie', 'Toasted sandwich with 2 fillings', 4.95, '/images/toastie.png'),
('lunch', 'Ham, Egg, Chips & Peas', 'Classic British lunch', 6.95, '/images/ham-egg-chips.png'),
('lunch', 'Scampi, Chips & Peas', 'Golden scampi with chips and peas', 6.95, '/images/scampi-chips.png'),
('lunch', 'Quiche', 'Fresh quiche with salad and coleslaw', 6.95, '/images/quiche-slice.png'),

-- Cakes & Bakes
('cakes', 'Slice of Cake', 'Homemade cake slice', 3.00, '/images/cakes-bakes-assorted.png'),
('cakes', 'Cheesecake Slice', 'Creamy cheesecake', 3.00, '/images/cakes-bakes-assorted.png'),
('cakes', 'Cupcake', 'Fluffy cupcake with icing', 2.50, '/images/cakes-bakes-assorted.png'),
('cakes', 'Brownies', 'Fudgy chocolate brownie', 3.50, '/images/cakes-bakes-assorted.png'),
('cakes', 'Blondies', 'White chocolate blondie', 3.50, '/images/cakes-bakes-assorted.png'),

-- Milkshakes
('milkshakes', 'Chocolate Milkshake', 'Rich chocolate milkshake', 3.95, '/images/milkshakes-row.png'),
('milkshakes', 'Strawberry Milkshake', 'Fresh strawberry milkshake', 3.95, '/images/milkshakes-row.png'),
('milkshakes', 'Banana Milkshake', 'Creamy banana milkshake', 3.95, '/images/milkshakes-row.png'),
('milkshakes', 'Vanilla Milkshake', 'Classic vanilla milkshake', 3.95, '/images/milkshakes-row.png'),
('milkshakes', 'Hazelnut Milkshake', 'Nutty hazelnut milkshake', 3.95, '/images/milkshakes-row.png'),
('milkshakes', 'Caramel Milkshake', 'Sweet caramel milkshake', 3.95, '/images/milkshakes-row.png'),
('milkshakes', 'Biscoff Milkshake', 'Indulgent biscoff milkshake', 3.95, '/images/milkshakes-row.png'),

-- Smoothies
('smoothies', 'Breakfast Smoothie', 'Berries, oats, milk', 3.95, '/images/smoothies-fresh.png'),
('smoothies', 'Mixed Berry', 'Strawberry, raspberry, blueberry, blackberry', 3.95, '/images/smoothies-fresh.png'),
('smoothies', 'Strawberry & Banana', 'Classic fruity blend', 3.95, '/images/smoothies-fresh.png'),
('smoothies', 'Exotic', 'Pineapple, mango, papaya', 3.95, '/images/smoothies-fresh.png'),
('smoothies', 'Apple a Day', 'Apple, raspberry, strawberry', 3.95, '/images/smoothies-fresh.png'),

-- Hot & Cold Drinks
('drinks', 'Tea', 'Traditional English breakfast tea', 1.50, '/images/hot-cold-drinks.png'),
('drinks', 'Herbal Tea', 'Selection of herbal teas', 2.00, '/images/hot-cold-drinks.png'),
('drinks', 'Coffee', 'Freshly brewed coffee', 2.00, '/images/hot-cold-drinks.png'),
('drinks', 'Americano', 'Espresso with hot water', 3.50, '/images/hot-cold-drinks.png'),
('drinks', 'Flat White', 'Strong coffee with steamed milk', 3.50, '/images/hot-cold-drinks.png'),
('drinks', 'Mocha', 'Coffee with chocolate and steamed milk', 3.50, '/images/hot-cold-drinks.png'),
('drinks', 'Cappuccino', 'Espresso with foamed milk', 3.50, '/images/hot-cold-drinks.png'),
('drinks', 'Hot Chocolate', 'Rich hot chocolate', 3.50, '/images/hot-cold-drinks.png'),
('drinks', 'Deluxe Hot Chocolate', 'Premium hot chocolate with extras', 4.00, '/images/hot-cold-drinks.png'),
('drinks', 'Iced Frappes', 'Cold blended coffee drinks', 4.00, '/images/hot-cold-drinks.png'),
('drinks', 'Cans', 'Selection of soft drinks', 1.50, '/images/hot-cold-drinks.png'),
('drinks', 'Water', 'Still or sparkling water', 1.00, '/images/hot-cold-drinks.png'),
('drinks', 'Fruit Shoot', 'Children''s fruit drink', 1.50, '/images/hot-cold-drinks.png');
