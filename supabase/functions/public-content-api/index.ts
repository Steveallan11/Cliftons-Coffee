Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        const url = new URL(req.url);
        const type = url.searchParams.get('type') || 'all';
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const published_only = url.searchParams.get('published') === 'true';
        const category = url.searchParams.get('category');

        let result: any = {};

        // Get events
        if (type === 'events' || type === 'all') {
            let eventsQuery = `${supabaseUrl}/rest/v1/events?select=*`;
            
            if (published_only) {
                eventsQuery += '&is_published=eq.true';
            }
            if (category) {
                eventsQuery += `&category_id=eq.${category}`;
            }
            
            eventsQuery += `&order=event_date.asc&limit=${limit}`;

            const eventsResponse = await fetch(eventsQuery, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            if (eventsResponse.ok) {
                result.events = await eventsResponse.json();
            }
        }

        // Get blog posts
        if (type === 'blog' || type === 'all') {
            let blogQuery = `${supabaseUrl}/rest/v1/blog_posts?select=*`;
            
            if (published_only) {
                blogQuery += '&is_published=eq.true';
            }
            if (category) {
                blogQuery += `&category_id=eq.${category}`;
            }
            
            blogQuery += `&order=publish_date.desc&limit=${limit}`;

            const blogResponse = await fetch(blogQuery, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            if (blogResponse.ok) {
                result.blog_posts = await blogResponse.json();
            }
        }

        // Get categories
        if (type === 'categories' || type === 'all') {
            const [eventCategoriesResponse, blogCategoriesResponse] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/event_categories?select=*&is_active=eq.true&order=name.asc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }),
                fetch(`${supabaseUrl}/rest/v1/blog_categories?select=*&is_active=eq.true&order=name.asc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                })
            ]);

            if (eventCategoriesResponse.ok) {
                result.event_categories = await eventCategoriesResponse.json();
            }
            if (blogCategoriesResponse.ok) {
                result.blog_categories = await blogCategoriesResponse.json();
            }
        }

        // Get upcoming events for calendar widget
        if (type === 'upcoming' || type === 'all') {
            const today = new Date().toISOString().split('T')[0];
            const upcomingResponse = await fetch(
                `${supabaseUrl}/rest/v1/events?select=*&is_published=eq.true&event_date=gte.${today}&order=event_date.asc&limit=5`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );
            
            if (upcomingResponse.ok) {
                result.upcoming_events = await upcomingResponse.json();
            }
        }

        // Get recent blog posts for widgets
        if (type === 'recent' || type === 'all') {
            const recentResponse = await fetch(
                `${supabaseUrl}/rest/v1/blog_posts?select=*&is_published=eq.true&order=publish_date.desc&limit=3`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );
            
            if (recentResponse.ok) {
                result.recent_posts = await recentResponse.json();
            }
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Public content API error:', error);

        const errorResponse = {
            error: {
                code: 'PUBLIC_CONTENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});