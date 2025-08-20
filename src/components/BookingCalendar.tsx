import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const localizer = momentLocalizer(moment);

interface Booking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  created_at: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

interface BookingCalendarProps {
  darkMode?: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ darkMode = false }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<any>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const { backendAvailable } = useAuth();

  // Mock data for demo mode
  const mockBookings: Booking[] = [
    {
      id: 1,
      customer_name: 'Emma Brown',
      customer_email: 'emma@example.com',
      customer_phone: '+44 123 456 789',
      party_size: 4,
      booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      booking_time: '12:00',
      status: 'pending',
      special_requests: 'Window table preferred',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      customer_name: 'David Lee',
      customer_email: 'david@example.com',
      customer_phone: '+44 987 654 321',
      party_size: 2,
      booking_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      booking_time: '14:30',
      status: 'confirmed',
      special_requests: null,
      created_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 3,
      customer_name: 'Sarah Wilson',
      customer_email: 'sarah@example.com',
      customer_phone: '+44 555 123 456',
      party_size: 6,
      booking_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      booking_time: '18:00',
      status: 'confirmed',
      special_requests: 'Birthday celebration - high chair needed',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  useEffect(() => {
    fetchBookings();
  }, [backendAvailable]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      if (!backendAvailable) {
        // Demo mode - use mock data
        const formattedEvents: CalendarEvent[] = mockBookings.map((booking: Booking) => {
          const bookingDateTime = moment(`${booking.booking_date} ${booking.booking_time}`);
          const endDateTime = moment(bookingDateTime).add(2, 'hours'); // Assume 2-hour booking duration

          return {
            id: booking.id,
            title: `${booking.customer_name} (${booking.party_size} guests)`,
            start: bookingDateTime.toDate(),
            end: endDateTime.toDate(),
            resource: booking,
          };
        });
        
        setBookings(mockBookings);
        setEvents(formattedEvents);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('table_bookings')
        .select('*')
        .order('booking_date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        // Fallback to mock data
        const formattedEvents: CalendarEvent[] = mockBookings.map((booking: Booking) => {
          const bookingDateTime = moment(`${booking.booking_date} ${booking.booking_time}`);
          const endDateTime = moment(bookingDateTime).add(2, 'hours');
          
          return {
            id: booking.id,
            title: `${booking.customer_name} (${booking.party_size} guests)`,
            start: bookingDateTime.toDate(),
            end: endDateTime.toDate(),
            resource: booking,
          };
        });
        
        setBookings(mockBookings);
        setEvents(formattedEvents);
        setLoading(false);
        return;
      }

      const formattedEvents: CalendarEvent[] = (data || []).map((booking: any) => {
        const bookingDateTime = moment(`${booking.booking_date} ${booking.booking_time}`);
        const endDateTime = moment(bookingDateTime).add(2, 'hours'); // Assume 2-hour booking duration

        return {
          id: booking.id,
          title: `${booking.customer_name} (${booking.party_size} guests)`,
          start: bookingDateTime.toDate(),
          end: endDateTime.toDate(),
          resource: {
            id: booking.id,
            customer_name: booking.customer_name,
            customer_email: booking.customer_email,
            customer_phone: booking.customer_phone,
            party_size: booking.party_size,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            status: booking.status,
            special_requests: booking.special_requests,
            created_at: booking.created_at
          },
        };
      });

      setBookings(data || []);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback to mock data
      const formattedEvents: CalendarEvent[] = mockBookings.map((booking: Booking) => {
        const bookingDateTime = moment(`${booking.booking_date} ${booking.booking_time}`);
        const endDateTime = moment(bookingDateTime).add(2, 'hours');
        
        return {
          id: booking.id,
          title: `${booking.customer_name} (${booking.party_size} guests)`,
          start: bookingDateTime.toDate(),
          end: endDateTime.toDate(),
          resource: booking,
        };
      });
      
      setBookings(mockBookings);
      setEvents(formattedEvents);
      toast.error('Using demo data - database connection issues');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const getEventStyle = (event: CalendarEvent) => {
    const booking = event.resource;
    let backgroundColor = '#3B82F6'; // blue for confirmed
    
    switch (booking.status) {
      case 'pending':
        backgroundColor = '#F59E0B'; // amber
        break;
      case 'confirmed':
        backgroundColor = '#10B981'; // green
        break;
      case 'completed':
        backgroundColor = '#6B7280'; // gray
        break;
      case 'cancelled':
        backgroundColor = '#EF4444'; // red
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      if (!backendAvailable) {
        // Demo mode - just update local state
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
        );
        setBookings(updatedBookings);
        
        const updatedEvents = events.map(event => 
          event.id === bookingId ? { 
            ...event, 
            resource: { ...event.resource, status: newStatus as any } 
          } : event
        );
        setEvents(updatedEvents);
        
        toast.success('Booking status updated successfully (Demo Mode)');
        setSelectedEvent(null);
        return;
      }

      const { error } = await supabase
        .from('table_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking status:', error);
        toast.error('Failed to update booking status');
        return;
      }

      // Refresh bookings
      fetchBookings();
      setSelectedEvent(null);
      toast.success('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-white' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Booking Calendar</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Pending</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Confirmed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
        <div className="h-96 md:h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={getEventStyle}
            className={darkMode ? 'dark-calendar' : ''}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
            }}
            style={{
              color: darkMode ? '#fff' : '#000',
            }}
          />
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Booking Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Name
                  </label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedEvent.resource.customer_name}</p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contact Information
                  </label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedEvent.resource.customer_email}</p>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedEvent.resource.customer_phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date & Time
                    </label>
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {moment(selectedEvent.start).format('MMM DD, YYYY')}
                    </p>
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {moment(selectedEvent.start).format('HH:mm')}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Party Size
                    </label>
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedEvent.resource.party_size} guests</p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.resource.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedEvent.resource.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedEvent.resource.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedEvent.resource.status.charAt(0).toUpperCase() + selectedEvent.resource.status.slice(1)}
                  </span>
                </div>

                {selectedEvent.resource.special_requests && (
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Special Requests
                    </label>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'} text-sm`}>
                      {selectedEvent.resource.special_requests}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  {selectedEvent.resource.status === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(selectedEvent.resource.id, 'confirmed')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  {selectedEvent.resource.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(selectedEvent.resource.id, 'completed')}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  {(selectedEvent.resource.status === 'pending' || selectedEvent.resource.status === 'confirmed') && (
                    <button
                      onClick={() => updateBookingStatus(selectedEvent.resource.id, 'cancelled')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;