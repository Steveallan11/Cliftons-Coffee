Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Create storage buckets
        const buckets = [
            { id: 'menu-images', name: 'menu-images', public: true },
            { id: 'event-images', name: 'event-images', public: true },
            { id: 'blog-images', name: 'blog-images', public: true }
        ];

        const results = [];

        for (const bucket of buckets) {
            // Create bucket
            const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: bucket.id,
                    name: bucket.name,
                    public: bucket.public,
                    allowed_mime_types: ['image/*'],
                    file_size_limit: 10485760
                })
            });

            if (createResponse.ok) {
                results.push({ bucket: bucket.id, status: 'created' });
            } else {
                const error = await createResponse.text();
                if (error.includes('already exists')) {
                    results.push({ bucket: bucket.id, status: 'already_exists' });
                } else {
                    results.push({ bucket: bucket.id, status: 'error', error });
                }
            }

            // Create RLS policies for public access
            const policies = [
                {
                    name: `Public read access for ${bucket.id}`,
                    definition: 'true',
                    action: 'SELECT',
                    table: `objects`
                },
                {
                    name: `Admin insert access for ${bucket.id}`,
                    definition: 'true',
                    action: 'INSERT',
                    table: `objects`
                },
                {
                    name: `Admin update access for ${bucket.id}`,
                    definition: 'true',
                    action: 'UPDATE',
                    table: `objects`
                },
                {
                    name: `Admin delete access for ${bucket.id}`,
                    definition: 'true',
                    action: 'DELETE',
                    table: `objects`
                }
            ];

            // Note: RLS policies would typically be created via SQL, but for now we'll handle permissions in the functions
        }

        return new Response(JSON.stringify({
            data: {
                message: 'Storage setup completed',
                results
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Storage setup error:', error);

        const errorResponse = {
            error: {
                code: 'STORAGE_SETUP_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});