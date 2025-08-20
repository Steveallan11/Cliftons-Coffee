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
        const { customerName, customerEmail, customerPhone, partySize, bookingDate, bookingTime, specialRequests } = await req.json();

        console.log('Table booking request received:', { customerEmail, partySize, bookingDate, bookingTime });

        // Validate required parameters
        if (!customerName || !customerEmail || !partySize || !bookingDate || !bookingTime) {
            throw new Error('Customer name, email, party size, booking date, and time are required');
        }

        if (partySize < 1 || partySize > 20) {
            throw new Error('Party size must be between 1 and 20 people');
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            throw new Error('Please provide a valid email address');
        }

        // Validate date format and ensure it's not in the past
        const bookingDateTime = new Date(`${bookingDate} ${bookingTime}`);
        const now = new Date();
        
        if (isNaN(bookingDateTime.getTime())) {
            throw new Error('Invalid date or time format');
        }

        if (bookingDateTime < now) {
            throw new Error('Booking date and time must be in the future');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Check for existing booking at the same time (basic conflict check)
        const conflictCheckResponse = await fetch(
            `${supabaseUrl}/rest/v1/table_bookings?booking_date=eq.${bookingDate}&booking_time=eq.${bookingTime}&status=neq.cancelled`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (conflictCheckResponse.ok) {
            const existingBookings = await conflictCheckResponse.json();
            const totalPartySize = existingBookings.reduce((sum, booking) => sum + booking.party_size, 0);
            
            // Assume max capacity of 50 people at any given time
            if (totalPartySize + partySize > 50) {
                throw new Error('Sorry, we do not have enough capacity available for your requested time. Please choose a different time.');
            }
        }

        // Create booking record in database
        const bookingData = {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone || null,
            party_size: partySize,
            booking_date: bookingDate,
            booking_time: bookingTime,
            status: 'pending',
            special_requests: specialRequests || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Creating booking in database...');

        const bookingResponse = await fetch(`${supabaseUrl}/rest/v1/table_bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(bookingData)
        });

        if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text();
            console.error('Failed to create booking:', errorText);
            throw new Error(`Failed to create booking: ${errorText}`);
        }

        const booking = await bookingResponse.json();
        console.log('Booking created successfully:', booking[0].id);

        const result = {
            data: {
                bookingId: booking[0].id,
                customerName: customerName,
                customerEmail: customerEmail,
                partySize: partySize,
                bookingDate: bookingDate,
                bookingTime: bookingTime,
                status: 'pending',
                message: 'Your table booking has been submitted and is pending approval. We will confirm your reservation shortly.'
            }
        };

        console.log('Table booking completed successfully');

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Table booking error:', error);

        const errorResponse = {
            error: {
                code: 'BOOKING_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});