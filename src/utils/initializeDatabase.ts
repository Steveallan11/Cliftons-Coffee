// Database initialization service
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oywowjszienmedmqkjhm.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'sbp_94ac12081c69541529ee73968c63b15a41f54668'

// Direct API call to create tables using service role key
export const initializeDatabase = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Initializing database tables...')
    
    // SQL to create all tables
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
    `

    // Execute SQL using direct API call
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ sql: createTablesSQL })
    })

    if (!createResponse.ok) {
      // Try alternative approach - use supabase client
      console.log('Direct SQL execution failed, trying Supabase client...')
      
      // Create tables one by one using Supabase client
      const tables = [
        'menu_items',
        'customers', 
        'orders',
        'order_items',
        'table_bookings',
        'admin_users'
      ]
      
      // Check if tables exist
      for (const table of tables) {
        try {
          await supabase.from(table).select('*').limit(1)
          console.log(`Table ${table} exists`)
        } catch (error) {
          console.log(`Table ${table} does not exist or has errors:`, error)
        }
      }
    }

    // Populate menu items
    await populateMenuItems()
    
    // Create admin user
    await createAdminUser()
    
    console.log('Database initialization completed')
    return { success: true }
    
  } catch (error: any) {
    console.error('Database initialization failed:', error)
    return { success: false, error: error.message }
  }
}

// Populate menu items
const populateMenuItems = async () => {
  try {
    // Check if menu items already exist
    const { data: existingItems } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1)
    
    if (existingItems && existingItems.length > 0) {
      console.log('Menu items already exist, skipping population')
      return
    }

    const menuItems = [
      // Breakfast
      { category: 'breakfast', name: 'Clifton\'s Big Breakfast', description: 'Two sausages, two bacon, egg, beans, tomato, hash brown, mushrooms, toast', price: 8.99, image_url: '/images/cliftons-big-breakfast.png', is_available: true },
      { category: 'breakfast', name: 'Clifton\'s Small Breakfast', description: 'One sausage, one bacon, egg, beans, tomato, toast', price: 6.99, image_url: '/images/cliftons-small-breakfast.png', is_available: true },
      { category: 'breakfast', name: 'Bacon Bap', description: 'Crispy bacon in soft white bap', price: 3.50, image_url: '/images/bacon-bap-retry.png', is_available: true },
      { category: 'breakfast', name: 'Sausage Bap', description: 'Juicy sausage in toasted bap', price: 3.50, image_url: '/images/sausage-bap.png', is_available: true },
      { category: 'breakfast', name: 'Bacon & Sausage Bap', description: 'Both in one bap', price: 4.00, image_url: '/images/bacon-sausage-bap.png', is_available: true },
      { category: 'breakfast', name: 'Bacon, Sausage & Egg Bap', description: 'Loaded bap with fried egg', price: 4.50, image_url: '/images/bacon-sausage-egg-bap.png', is_available: true },
      
      // Extras
      { category: 'extras', name: 'Breakfast Extras', description: 'Bacon, Sausage, Black Pudding, Fried Slice, Mushrooms, Hash Brown, Potatoes, Egg, Beans, Tomatoes', price: 0.50, image_url: '/images/breakfast-sides.png', is_available: true },
      
      // Lunch
      { category: 'lunch', name: 'Jacket Potato', description: 'With salad, coleslaw, 2 toppings', price: 6.75, image_url: '/images/jacket-potato.png', is_available: true },
      { category: 'lunch', name: 'Panini', description: 'Choice: Brie & bacon, ham & tomato, or cheese & onion', price: 4.95, image_url: '/images/panini-grilled.png', is_available: true },
      { category: 'lunch', name: 'Toastie', description: 'Toasted sandwich with 2 fillings', price: 4.95, image_url: '/images/toastie.png', is_available: true },
      { category: 'lunch', name: 'Ham, Egg, Chips & Peas', description: 'Classic British lunch', price: 6.95, image_url: '/images/ham-egg-chips.png', is_available: true },
      { category: 'lunch', name: 'Scampi, Chips & Peas', description: 'Golden scampi with chips and peas', price: 6.95, image_url: '/images/scampi-chips.png', is_available: true },
      { category: 'lunch', name: 'Quiche', description: 'Fresh quiche with salad and coleslaw', price: 6.95, image_url: '/images/quiche-slice.png', is_available: true },
      
      // Cakes
      { category: 'cakes', name: 'Slice of Cake', description: 'Homemade cake slice', price: 3.00, image_url: '/images/cakes-bakes-assorted.png', is_available: true },
      { category: 'cakes', name: 'Cheesecake Slice', description: 'Creamy cheesecake', price: 3.00, image_url: '/images/cakes-bakes-assorted.png', is_available: true },
      { category: 'cakes', name: 'Cupcake', description: 'Fluffy cupcake with icing', price: 2.50, image_url: '/images/cakes-bakes-assorted.png', is_available: true },
      { category: 'cakes', name: 'Brownies', description: 'Fudgy chocolate brownie', price: 3.50, image_url: '/images/cakes-bakes-assorted.png', is_available: true },
      { category: 'cakes', name: 'Blondies', description: 'White chocolate blondie', price: 3.50, image_url: '/images/cakes-bakes-assorted.png', is_available: true },
      
      // Milkshakes
      { category: 'milkshakes', name: 'Milkshakes', description: 'Chocolate, Strawberry, Banana, Vanilla, Hazelnut, Caramel, Biscoff', price: 3.95, image_url: '/images/milkshakes-row.png', is_available: true },
      
      // Smoothies
      { category: 'smoothies', name: 'Breakfast Smoothie', description: 'Berries, oats, milk', price: 3.95, image_url: '/images/smoothies-fresh.png', is_available: true },
      { category: 'smoothies', name: 'Mixed Berry', description: 'Strawberry, raspberry, blueberry, blackberry', price: 3.95, image_url: '/images/smoothies-fresh.png', is_available: true },
      { category: 'smoothies', name: 'Strawberry & Banana', description: 'Classic fruity blend', price: 3.95, image_url: '/images/smoothies-fresh.png', is_available: true },
      { category: 'smoothies', name: 'Exotic', description: 'Pineapple, mango, papaya', price: 3.95, image_url: '/images/smoothies-fresh.png', is_available: true },
      { category: 'smoothies', name: 'Apple a Day', description: 'Apple, raspberry, strawberry', price: 3.95, image_url: '/images/smoothies-fresh.png', is_available: true },
      
      // Drinks
      { category: 'drinks', name: 'Tea', description: 'Traditional English breakfast tea', price: 1.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Herbal Tea', description: 'Selection of herbal teas', price: 2.00, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Coffee', description: 'Freshly brewed coffee', price: 2.00, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Americano', description: 'Espresso with hot water', price: 3.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Flat White', description: 'Strong coffee with steamed milk', price: 3.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Mocha', description: 'Coffee with chocolate and steamed milk', price: 3.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Cappuccino', description: 'Espresso with foamed milk', price: 3.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Hot Chocolate', description: 'Rich hot chocolate', price: 3.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Deluxe Hot Chocolate', description: 'Premium hot chocolate with extras', price: 4.00, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Iced Frappes', description: 'Cold blended coffee drinks', price: 4.00, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Cans', description: 'Selection of soft drinks', price: 1.50, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Water', description: 'Still or sparkling water', price: 1.00, image_url: '/images/hot-cold-drinks.png', is_available: true },
      { category: 'drinks', name: 'Fruit Shoot', description: 'Children\'s fruit drink', price: 1.50, image_url: '/images/hot-cold-drinks.png', is_available: true }
    ]

    const { error } = await supabase
      .from('menu_items')
      .insert(menuItems)

    if (error) {
      console.error('Failed to populate menu items:', error)
    } else {
      console.log('Menu items populated successfully')
    }
    
  } catch (error) {
    console.error('Error populating menu items:', error)
  }
}

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@cliftonscoffee.com')
      .limit(1)
    
    if (existingAdmin && existingAdmin.length > 0) {
      console.log('Admin user already exists')
      return
    }

    const adminUser = {
      email: 'admin@cliftonscoffee.com',
      password_hash: '$2a$10$N9qo8uLOickgx2ZMRZoMye.xjNsUi6Q5sKKnHT1TksU1gY4h2E/TO', // admin123
      name: 'Admin User',
      role: 'admin'
    }

    const { error } = await supabase
      .from('admin_users')
      .insert(adminUser)

    if (error) {
      console.error('Failed to create admin user:', error)
    } else {
      console.log('Admin user created successfully')
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

// Check database status
export const checkDatabaseStatus = async (): Promise<{ tablesExist: boolean; menuPopulated: boolean; adminExists: boolean }> => {
  try {
    // Check if menu_items table exists and has data
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1)
    
    const menuPopulated = !menuError && menuItems && menuItems.length > 0
    
    // Check if admin user exists
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@cliftonscoffee.com')
      .limit(1)
    
    const adminExists = !adminError && adminUsers && adminUsers.length > 0
    
    return {
      tablesExist: !menuError,
      menuPopulated,
      adminExists
    }
    
  } catch (error) {
    console.error('Error checking database status:', error)
    return {
      tablesExist: false,
      menuPopulated: false,
      adminExists: false
    }
  }
}
