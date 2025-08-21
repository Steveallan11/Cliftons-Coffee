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

        let result;

        switch (action) {
            case 'get_menu_items':
                const menuResponse = await fetch(`${supabaseUrl}/rest/v1/menu_items?select=*&order=category.asc,sort_order.asc,name.asc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                result = await menuResponse.json();
                break;

            case 'get_categories':
                const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/menu_categories?select=*&order=display_order.asc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                result = await categoriesResponse.json();
                break;

            case 'create_menu_item':
                const createResponse = await fetch(`${supabaseUrl}/rest/v1/menu_items`, {
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
                        price: data.price,
                        category: data.category,
                        image_url: data.image_url,
                        is_available: data.is_available !== undefined ? data.is_available : true,
                        stock_level: data.stock_level || null,
                        sort_order: data.sort_order || 0
                    })
                });
                if (!createResponse.ok) {
                    throw new Error('Failed to create menu item');
                }
                result = await createResponse.json();
                break;

            case 'update_menu_item':
                // Track price changes
                if (data.price !== undefined) {
                    const currentItemResponse = await fetch(`${supabaseUrl}/rest/v1/menu_items?select=price_history,price&id=eq.${data.id}`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });
                    const currentItem = await currentItemResponse.json();
                    if (currentItem[0] && currentItem[0].price !== data.price) {
                        const priceHistory = currentItem[0].price_history || [];
                        priceHistory.push({
                            old_price: currentItem[0].price,
                            new_price: data.price,
                            changed_at: new Date().toISOString()
                        });
                        data.price_history = priceHistory;
                    }
                }

                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${data.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        ...(data.name !== undefined && { name: data.name }),
                        ...(data.description !== undefined && { description: data.description }),
                        ...(data.price !== undefined && { price: data.price }),
                        ...(data.category !== undefined && { category: data.category }),
                        ...(data.image_url !== undefined && { image_url: data.image_url }),
                        ...(data.is_available !== undefined && { is_available: data.is_available }),
                        ...(data.stock_level !== undefined && { stock_level: data.stock_level }),
                        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
                        ...(data.price_history !== undefined && { price_history: data.price_history }),
                        updated_at: new Date().toISOString()
                    })
                });
                if (!updateResponse.ok) {
                    throw new Error('Failed to update menu item');
                }
                result = await updateResponse.json();
                break;

            case 'delete_menu_item':
                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${data.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete menu item');
                }
                result = { success: true };
                break;

            case 'bulk_update_availability':
                const bulkUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=in.(${data.ids.join(',')})`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        is_available: data.is_available,
                        updated_at: new Date().toISOString()
                    })
                });
                if (!bulkUpdateResponse.ok) {
                    throw new Error('Failed to bulk update availability');
                }
                result = { success: true };
                break;

            case 'create_category':
                const createCategoryResponse = await fetch(`${supabaseUrl}/rest/v1/menu_categories`, {
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
                        display_order: data.display_order || 0
                    })
                });
                if (!createCategoryResponse.ok) {
                    throw new Error('Failed to create category');
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
        console.error('Menu management error:', error);

        const errorResponse = {
            error: {
                code: 'MENU_MANAGEMENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});