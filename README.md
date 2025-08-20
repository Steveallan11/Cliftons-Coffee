# Clifton's Coffee Shop

A modern full-stack web application for Clifton's Coffee Shop featuring online ordering, table reservations, and comprehensive admin management.

## Features

### Customer Features
- **Menu Browsing**: View coffee, food, and beverage options
- **Online Ordering**: Place orders for pickup or delivery
- **Table Reservations**: Book tables for dine-in experiences
- **Contact Form**: Send messages directly to the restaurant

### Admin Features
- **Order Management**: View and manage all customer orders
- **Reservation System**: Manage table bookings with calendar view
- **Message Center**: Handle customer inquiries
- **Analytics Dashboard**: Track sales, popular items, and business metrics
- **Menu Management**: Update items, prices, and availability

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Payments**: Stripe Integration
- **Deployment**: Vercel
- **Version Control**: GitHub

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cliftons-coffee-shop.git
   cd cliftons-coffee-shop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Deployment

This app is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

## Admin Access

- **URL**: `/admin`
- **Email**: `admin@cliftonscoffee.com`
- **Password**: `admin123`

## Database Schema

The app uses the following main tables:
- `menu_items` - Restaurant menu
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `table_bookings` - Table reservations
- `contact_messages` - Customer inquiries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for Clifton's Coffee Shop**