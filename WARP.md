# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Backend Development
```bash
# Start backend in development mode with hot reload
cd backend
npm run dev
```

```bash
# Start backend in production mode
cd backend
npm start
```

```bash
# Install backend dependencies
cd backend
npm install
```

### Frontend Development
```bash
# Start React development server
cd frontend
npm start
```

```bash
# Build frontend for production
cd frontend
npm run build
```

```bash
# Run React tests
cd frontend
npm test
```

```bash
# Install frontend dependencies
cd frontend
npm install
```

### Database Setup
```bash
# Import database schema (run from project root)
mysql -u root -p ecommerce_db < backend/config/schema.sql
```

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE ecommerce_db;"
```

### Environment Configuration
```bash
# Copy environment example (Windows)
cd backend
copy .env.example .env
```

## Architecture Overview

This is a full-stack e-commerce application with a **three-tier architecture**:

### Backend (Node.js/Express)
- **Entry Point**: `backend/server.js` - Main server configuration and middleware setup
- **Database Layer**: `backend/config/database.js` - MySQL connection pool using mysql2
- **Authentication**: JWT-based auth with middleware in `backend/middleware/auth.js`
- **API Structure**: RESTful routes organized by domain:
  - `routes/auth.js` - User registration/login
  - `routes/products.js` - Product catalog and categories
  - `routes/cart.js` - Shopping cart operations (requires auth)
  - `routes/orders.js` - Order management (requires auth)

### Frontend (React)
- **Entry Point**: `frontend/src/index.js` → `App.js`
- **Routing**: React Router with protected routes for authenticated features
- **State Management**: React hooks with localStorage persistence for user sessions
- **API Layer**: Centralized in `frontend/src/services/api.js` with axios interceptors for token handling
- **Component Structure**:
  - `components/` - Reusable UI components (Header, etc.)
  - `pages/` - Route-level page components (Home, Login, etc.)

### Database (MySQL)
- **Schema**: Defined in `backend/config/schema.sql`
- **Core Tables**: users, categories, products, cart, orders, order_items
- **Relationships**: Foreign keys with CASCADE deletes for data integrity
- **Sample Data**: Included in schema for development

## Key Design Patterns

### Authentication Flow
1. Login generates JWT token (24h expiration)
2. Frontend stores token in localStorage
3. API service automatically attaches Bearer token to authenticated requests
4. Backend middleware validates tokens on protected routes

### Database Pattern
- Uses connection pooling for performance
- All database operations use prepared statements
- Promise-based queries with mysql2

### API Response Pattern
- Consistent error handling with try/catch blocks
- Standard HTTP status codes
- JSON responses with descriptive error messages

## Development Guidelines

### Backend Development
- All routes use async/await pattern
- Database queries use parameterized statements to prevent SQL injection
- JWT tokens expire in 24 hours
- CORS enabled for frontend communication
- Error handling middleware catches unhandled errors

### Frontend Development
- API calls centralized in services layer
- Token management handled automatically by axios interceptors
- Component state managed with React hooks
- Routing uses React Router v6 patterns

### Database Development
- Foreign key constraints ensure data integrity
- Unique constraints prevent duplicate users/cart items
- Timestamps automatically managed for audit trails
- Sample data included for development testing

## Environment Variables

Required backend environment variables in `.env`:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection
- `PORT` - Server port (default 5000)
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Environment mode

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:categoryId` - Products by category
- `GET /api/products/categories/all` - All categories

### Authenticated Endpoints (require Bearer token)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item quantity
- `DELETE /api/cart/remove/:id` - Remove cart item
- `DELETE /api/cart/clear` - Clear entire cart
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders/create` - Create order from cart

## Testing Strategy

The application currently has basic test setup:
- Frontend: React Testing Library and Jest configured
- Backend: No test framework currently configured
- Database: Sample data provided for manual testing

## Common Development Scenarios

### Adding New API Endpoints
1. Create route handler in appropriate `routes/` file
2. Add authentication middleware if needed: `router.use(authenticateToken)`
3. Update `frontend/src/services/api.js` with new API call
4. Test with both authenticated and unauthenticated requests

### Adding New React Components
1. Create component in `components/` for reusable UI or `pages/` for routes
2. Update routing in `App.js` if needed
3. Import and use API services for data fetching
4. Handle loading states and error conditions

### Database Schema Changes
1. Update `backend/config/schema.sql` with new tables/columns
2. Consider migration strategy for existing data
3. Update related API routes and frontend components
4. Test foreign key relationships and constraints
