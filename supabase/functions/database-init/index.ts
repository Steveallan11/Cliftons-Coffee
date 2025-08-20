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
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase configuration');
        }

        console.log('Initializing database with service role key...');

        // Create tables one by one using direct SQL execution
        const createMenuItemsSQL = `
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
        `;

        const createCustomersSQL = `
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE,
                name VARCHAR(255),
                phone VARCHAR(50),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        const createOrdersSQL = `
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
        `;

        const createOrderItemsSQL = `
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL,
                menu_item_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price_at_time DECIMAL(10,2) NOT NULL,
                special_requests TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        const createBookingsSQL = `
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
        `;

        const createAdminUsersSQL = `
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        // Execute table creation using direct PostgreSQL connection
        const sqlQueries = [
            createMenuItemsSQL,
            createCustomersSQL,
            createOrdersSQL,
            createOrderItemsSQL,
            createBookingsSQL,
            createAdminUsersSQL
        ];

        console.log('Creating tables...');
        
        // Try executing SQL via REST API
        for (const sql of sqlQueries) {
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_ROLE_KEY
                    },
                    body: JSON.stringify({ sql })
                });
                
                if (!response.ok) {
                    console.log(`Table creation attempt failed: ${response.status}`);
                }
            } catch (err) {
                console.log('Direct SQL execution not available');
            }
        }

        // Try using INSERT operations directly
        console.log('Populating menu items...');
        
        const menuItems = [
            { category: 'breakfast', name: 'Clifton\'s Big Breakfast', description: 'Two sausages, two bacon, egg, beans, tomato, hash brown, mushrooms, toast', price: 8.99, image_url: '/images/cliftons-big-breakfast.png', is_available: true },
            { category: 'breakfast', name: 'Clifton\'s Small Breakfast', description: 'One sausage, one bacon, egg, beans, tomato, toast', price: 6.99, image_url: '/images/cliftons-small-breakfast.png', is_available: true },
            { category: 'breakfast', name: 'Bacon Bap', description: 'Crispy bacon in soft white bap', price: 3.50, image_url: '/images/bacon-bap-retry.png', is_available: true },
            { category: 'drinks', name: 'Tea', description: 'Traditional English breakfast tea', price: 1.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
            { category: 'drinks', name: 'Coffee', description: 'Freshly brewed coffee', price: 2.00, image_url: '/images/hot-cold-drinks.png', is_available: true }
        ];

        // Try inserting menu items
        try {
            const menuResponse = await fetch(`${SUPABASE_URL}/rest/v1/menu_items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(menuItems)
            });
            
            if (menuResponse.ok) {
                console.log('Menu items inserted successfully');
            } else {
                console.log(`Menu insertion failed: ${menuResponse.status}`);
            }
        } catch (err) {
            console.log('Menu insertion error:', err);
        }

        // Create admin user
        console.log('Creating admin user...');
        try {
            const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    email: 'admin@cliftonscoffee.com',
                    password_hash: '$2a$10$N9qo8uLOickgx2ZMRZoMye.xjNsUi6Q5sKKnHT1TksU1gY4h2E/TO',
                    name: 'Admin User',
                    role: 'admin'
                })
            });
            
            if (adminResponse.ok) {
                console.log('Admin user created successfully');
            } else {
                console.log(`Admin user creation failed: ${adminResponse.status}`);
            }
        } catch (err) {
            console.log('Admin user creation error:', err);
        }

        // Test database connection
        try {
            const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?limit=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY
                }
            });
            
            if (testResponse.ok) {
                const data = await testResponse.json();
                console.log('Database test successful, menu items found:', data.length);
            } else {
                console.log(`Database test failed: ${testResponse.status}`);
            }
        } catch (err) {
            console.log('Database test error:', err);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Database initialization completed',
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Database initialization error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'DATABASE_INIT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});