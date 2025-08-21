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

        // Helper function to calculate reading time
        const calculateReadingTime = (content: string): number => {
            const wordsPerMinute = 200;
            const words = content.split(/\s+/).length;
            return Math.ceil(words / wordsPerMinute);
        };

        let result;

        switch (action) {
            case 'get_blog_posts':
                const postsResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?select=*&order=publish_date.desc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                result = await postsResponse.json();
                break;

            case 'get_blog_categories':
                const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/blog_categories?select=*&order=name.asc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                result = await categoriesResponse.json();
                break;

            case 'create_blog_post':
                const slug = generateSlug(data.title);
                const readingTime = calculateReadingTime(data.content || '');
                
                const createResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts`, {
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
                        content: data.content,
                        excerpt: data.excerpt,
                        featured_image: data.featured_image,
                        category_id: data.category_id,
                        is_published: data.is_published !== undefined ? data.is_published : false,
                        publish_date: data.publish_date || new Date().toISOString(),
                        author_name: data.author_name || "Clifton's Coffee Shop",
                        meta_title: data.meta_title || data.title,
                        meta_description: data.meta_description || data.excerpt,
                        reading_time: readingTime
                    })
                });
                if (!createResponse.ok) {
                    const error = await createResponse.text();
                    throw new Error(`Failed to create blog post: ${error}`);
                }
                result = await createResponse.json();
                break;

            case 'update_blog_post':
                const updateData: any = {
                    updated_at: new Date().toISOString()
                };
                
                if (data.title !== undefined) {
                    updateData.title = data.title;
                    updateData.slug = generateSlug(data.title);
                    updateData.meta_title = data.meta_title || data.title;
                }
                if (data.content !== undefined) {
                    updateData.content = data.content;
                    updateData.reading_time = calculateReadingTime(data.content);
                }
                if (data.excerpt !== undefined) {
                    updateData.excerpt = data.excerpt;
                    if (!data.meta_description) {
                        updateData.meta_description = data.excerpt;
                    }
                }
                if (data.featured_image !== undefined) updateData.featured_image = data.featured_image;
                if (data.category_id !== undefined) updateData.category_id = data.category_id;
                if (data.is_published !== undefined) updateData.is_published = data.is_published;
                if (data.publish_date !== undefined) updateData.publish_date = data.publish_date;
                if (data.author_name !== undefined) updateData.author_name = data.author_name;
                if (data.meta_title !== undefined) updateData.meta_title = data.meta_title;
                if (data.meta_description !== undefined) updateData.meta_description = data.meta_description;

                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${data.id}`, {
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
                    throw new Error('Failed to update blog post');
                }
                result = await updateResponse.json();
                break;

            case 'delete_blog_post':
                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${data.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete blog post');
                }
                result = { success: true };
                break;

            case 'create_blog_category':
                const categorySlug = generateSlug(data.name);
                const createCategoryResponse = await fetch(`${supabaseUrl}/rest/v1/blog_categories`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: data.name,
                        slug: categorySlug,
                        description: data.description,
                        color: data.color || '#9CAF88'
                    })
                });
                if (!createCategoryResponse.ok) {
                    throw new Error('Failed to create blog category');
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
        console.error('Blog management error:', error);

        const errorResponse = {
            error: {
                code: 'BLOG_MANAGEMENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});