Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get Supabase service role key from environment
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase configuration');
        }

        // Create the database tables
        const createTablesSQL = `
            -- Create menu_items table
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image_url VARCHAR(500),
                is_available BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Create customers table
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE,
                name VARCHAR(255),
                phone VARCHAR(50),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Create orders table  
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER,
                customer_email VARCHAR(255),
                customer_name VARCHAR(255),
                customer_phone VARCHAR(50),
                order_type VARCHAR(50) NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                stripe_payment_intent_id VARCHAR(255),
                special_instructions TEXT,
                delivery_address TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Create order_items table
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL,
                menu_item_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price_at_time DECIMAL(10,2) NOT NULL,
                special_requests TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Create table_bookings table
            CREATE TABLE IF NOT EXISTS table_bookings (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50),
                party_size INTEGER NOT NULL,
                booking_date DATE NOT NULL,
                booking_time TIME NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                special_requests TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Create admin_users table
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
            CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
            CREATE INDEX IF NOT EXISTS idx_bookings_date ON table_bookings(booking_date);
            CREATE INDEX IF NOT EXISTS idx_bookings_status ON table_bookings(status);
        `;

        // Execute the table creation SQL
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql_execute`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({ sql: createTablesSQL })
        });

        if (!createResponse.ok) {
            // Try alternative approach - use direct SQL query
            const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY
                },
                body: JSON.stringify({ query: createTablesSQL })
            });

            if (!altResponse.ok) {
                console.log('Both SQL execution methods failed, using REST API approach');
            }
        }

        // Menu data to populate
        const menuData = {
            "breakfast": [
                {"id": 1, "name": "Clifton's Big Breakfast", "description": "Two sausages, two bacon, egg, beans, tomato, hash brown, mushrooms, toast", "price": 8.99, "image": "/images/cliftons-big-breakfast.png", "category": "breakfast", "available": true},
                {"id": 2, "name": "Clifton's Small Breakfast", "description": "One sausage, one bacon, egg, beans, tomato, toast", "price": 6.99, "image": "/images/cliftons-small-breakfast.png", "category": "breakfast", "available": true},
                {"id": 3, "name": "Bacon Bap", "description": "Crispy bacon in soft white bap", "price": 3.50, "image": "/images/bacon-bap-retry.png", "category": "breakfast", "available": true},
                {"id": 4, "name": "Sausage Bap", "description": "Juicy sausage in toasted bap", "price": 3.50, "image": "/images/sausage-bap.png", "category": "breakfast", "available": true},
                {"id": 5, "name": "Bacon & Sausage Bap", "description": "Both in one bap", "price": 4.00, "image": "/images/bacon-sausage-bap.png", "category": "breakfast", "available": true},
                {"id": 6, "name": "Bacon, Sausage & Egg Bap", "description": "Loaded bap with fried egg", "price": 4.50, "image": "/images/bacon-sausage-egg-bap.png", "category": "breakfast", "available": true}
            ],
            "lunch": [
                {"id": 8, "name": "Jacket Potato", "description": "With salad, coleslaw, 2 toppings", "price": 6.75, "image": "/images/jacket-potato.png", "category": "lunch", "available": true},
                {"id": 9, "name": "Panini", "description": "Choice: Brie & bacon, ham & tomato, or cheese & onion", "price": 4.95, "image": "/images/panini-grilled.png", "category": "lunch", "available": true},
                {"id": 10, "name": "Toastie", "description": "Toasted sandwich with 2 fillings", "price": 4.95, "image": "/images/toastie.png", "category": "lunch", "available": true},
                {"id": 11, "name": "Ham, Egg, Chips & Peas", "description": "Classic British lunch", "price": 6.95, "image": "/images/ham-egg-chips.png", "category": "lunch", "available": true},
                {"id": 12, "name": "Scampi, Chips & Peas", "description": "Golden scampi with chips and peas", "price": 6.95, "image": "/images/scampi-chips.png", "category": "lunch", "available": true},
                {"id": 13, "name": "Quiche", "description": "Fresh quiche with salad and coleslaw", "price": 6.95, "image": "/images/quiche-slice.png", "category": "lunch", "available": true}
            ],
            "cakes": [
                {"id": 14, "name": "Slice of Cake", "description": "Homemade cake slice", "price": 3.00, "image": "/images/cakes-bakes-assorted.png", "category": "cakes", "available": true},
                {"id": 15, "name": "Cheesecake Slice", "description": "Creamy cheesecake", "price": 3.00, "image": "/images/cakes-bakes-assorted.png", "category": "cakes", "available": true},
                {"id": 16, "name": "Cupcake", "description": "Fluffy cupcake with icing", "price": 2.50, "image": "/images/cakes-bakes-assorted.png", "category": "cakes", "available": true},
                {"id": 17, "name": "Brownies", "description": "Fudgy chocolate brownie", "price": 3.50, "image": "/images/cakes-bakes-assorted.png", "category": "cakes", "available": true},
                {"id": 18, "name": "Blondies", "description": "White chocolate blondie", "price": 3.50, "image": "/images/cakes-bakes-assorted.png", "category": "cakes", "available": true}
            ],
            "drinks": [
                {"id": 25, "name": "Tea", "description": "Traditional English breakfast tea", "price": 1.50, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 26, "name": "Herbal Tea", "description": "Selection of herbal teas", "price": 2.00, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 27, "name": "Coffee", "description": "Freshly brewed coffee", "price": 2.00, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 28, "name": "Americano", "description": "Espresso with hot water", "price": 3.50, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 29, "name": "Flat White", "description": "Strong coffee with steamed milk", "price": 3.50, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 30, "name": "Mocha", "description": "Coffee with chocolate and steamed milk", "price": 3.50, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 31, "name": "Cappuccino", "description": "Espresso with foamed milk", "price": 3.50, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 32, "name": "Hot Chocolate", "description": "Rich hot chocolate", "price": 3.50, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 33, "name": "Deluxe Hot Chocolate", "description": "Premium hot chocolate with extras", "price": 4.00, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 34, "name": "Iced Frappes", "description": "Cold blended coffee drinks", "price": 4.00, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 35, "name": "Cans", "description": "Selection of soft drinks", "price": 1.50, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true},
                {"id": 36, "name": "Water", "description": "Still or sparkling water", "price": 1.00, "image": "/images/hot-cold-drinks.png", "category": "drinks", "available": true}
            ]
        };

        // Transform and populate menu items
        const menuItems = [];
        Object.keys(menuData).forEach(category => {
            menuData[category].forEach(item => {
                menuItems.push({
                    category: item.category,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    image_url: item.image,
                    is_available: item.available
                });
            });
        });

        // Insert menu items using REST API
        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/menu_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(menuItems)
        });

        let menuInsertResult = 'Menu items inserted successfully';
        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            menuInsertResult = `Menu insert failed: ${errorText}`;
        }

        // Create default admin user (password: admin123)
        const adminUser = {
            email: 'admin@cliftonscoffee.com',
            password_hash: '$2a$10$N9qo8uLOickgx2ZMRZoMye.xjNsUi6Q5sKKnHT1TksU1gY4h2E/TO', // admin123 hashed
            name: 'Admin User',
            role: 'admin'
        };

        const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(adminUser)
        });

        let adminResult = 'Admin user created successfully';
        if (!adminResponse.ok) {
            const errorText = await adminResponse.text();
            adminResult = `Admin user creation failed: ${errorText}`;
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Database initialized successfully',
            details: {
                menuItems: menuInsertResult,
                adminUser: adminResult
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Database initialization error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'INIT_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});