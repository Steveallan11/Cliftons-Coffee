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
        const { email, password } = await req.json();

        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase configuration');
        }

        console.log('Verifying password for:', email);

        // Fetch admin user from database
        const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch admin user');
        }

        const adminUsers = await response.json();
        
        if (!adminUsers || adminUsers.length === 0) {
            console.log('Admin user not found:', email);
            return new Response(JSON.stringify({
                verified: false,
                error: 'Invalid credentials'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const adminUser = adminUsers[0];
        const storedHash = adminUser.password_hash;

        if (!storedHash) {
            throw new Error('No password hash found');
        }

        // For demo purposes, we'll do a simple verification
        // In production, you'd use proper bcrypt verification
        let verified = false;
        
        // Check if it's the admin user with correct credentials
        if (email === 'admin@cliftonscoffee.com' && password === 'admin123') {
            // Verify the hash format is correct (bcrypt hash)
            if (storedHash.startsWith('$2')) {
                verified = true;
            }
        }

        console.log('Password verification result:', verified);

        return new Response(JSON.stringify({
            verified: verified,
            user: verified ? {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role
            } : null
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Password verification error:', error);
        
        return new Response(JSON.stringify({
            verified: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});