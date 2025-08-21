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
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Verify admin user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Unauthorized access');
        }

        const requestData = await req.json();
        const { action, ...data } = requestData;

        // Helper function to generate slug
        const generateSlug = (title: string): string => {
            return title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        };

        let result;

        switch (action) {
            case 'get_events':
                const eventsResponse = await fetch(`${supabaseUrl}/rest/v1/events?select=*&order=event_date.asc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                result = await eventsResponse.json();
                break;

            case 'get_event_categories':
                const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/event_categories?select=*&order=name.asc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                result = await categoriesResponse.json();
                break;

            case 'create_event':
                const slug = generateSlug(data.title);
                const createResponse = await fetch(`${supabaseUrl}/rest/v1/events`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        title: data.title,
                        slug,
                        description: data.description,
                        event_date: data.event_date,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        location: data.location,
                        image_url: data.image_url,
                        category_id: data.category_id,
                        is_published: data.is_published !== undefined ? data.is_published : false,
                        max_attendees: data.max_attendees,
                        ticket_price: data.ticket_price || 0
                    })
                });
                if (!createResponse.ok) {
                    const error = await createResponse.text();
                    throw new Error(`Failed to create event: ${error}`);
                }
                result = await createResponse.json();
                break;

            case 'update_event':
                const updateData: any = {
                    updated_at: new Date().toISOString()
                };
                
                if (data.title !== undefined) {
                    updateData.title = data.title;
                    updateData.slug = generateSlug(data.title);
                }
                if (data.description !== undefined) updateData.description = data.description;
                if (data.event_date !== undefined) updateData.event_date = data.event_date;
                if (data.start_time !== undefined) updateData.start_time = data.start_time;
                if (data.end_time !== undefined) updateData.end_time = data.end_time;
                if (data.location !== undefined) updateData.location = data.location;
                if (data.image_url !== undefined) updateData.image_url = data.image_url;
                if (data.category_id !== undefined) updateData.category_id = data.category_id;
                if (data.is_published !== undefined) updateData.is_published = data.is_published;
                if (data.max_attendees !== undefined) updateData.max_attendees = data.max_attendees;
                if (data.ticket_price !== undefined) updateData.ticket_price = data.ticket_price;

                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${data.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(updateData)
                });
                if (!updateResponse.ok) {
                    throw new Error('Failed to update event');
                }
                result = await updateResponse.json();
                break;

            case 'delete_event':
                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${data.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete event');
                }
                result = { success: true };
                break;

            case 'create_event_category':
                const createCategoryResponse = await fetch(`${supabaseUrl}/rest/v1/event_categories`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: data.name,
                        description: data.description,
                        color: data.color || '#9CAF88'
                    })
                });
                if (!createCategoryResponse.ok) {
                    throw new Error('Failed to create event category');
                }
                result = await createCategoryResponse.json();
                break;

            default:
                throw new Error('Invalid action');
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Events management error:', error);

        const errorResponse = {
            error: {
                code: 'EVENTS_MANAGEMENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});