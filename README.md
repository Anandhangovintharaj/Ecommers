# E-Commerce Web Application

A full-stack e-commerce web application built with React, Node.js, Express, and MySQL.

## Features

- User authentication (register/login)
- Product catalog with categories
- Shopping cart functionality
- Order management
- Responsive design

## Project Structure

```
ecommerce-webapp/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database and environment configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── public/            # Static files
│   └── src/               # React components and pages
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       └── services/      # API service functions
└── README.md
```

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [MySQL](https://dev.mysql.com/downloads/) (version 8.0 or higher)
- npm (comes with Node.js)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ecommerce-webapp
```

### 2. Set up the database
1. Start your MySQL server
2. Create a new database:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```
3. Import the database schema:
   ```bash
   mysql -u root -p ecommerce_db < backend/config/schema.sql
   ```

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create environment variables file:
   ```bash
   copy .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ecommerce_db
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

### 4. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

### Production Mode

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/categories/all` - Get all categories

### Cart (Authenticated)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item quantity
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders (Authenticated)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order details
- `POST /api/orders/create` - Create new order from cart

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Items within orders

## Technologies Used

### Backend
- Node.js
- Express.js
- MySQL2
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React
- React Router for navigation
- Axios for HTTP requests
- CSS3 for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please contact [your-email@example.com] or create an issue in the repository.
