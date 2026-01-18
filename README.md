# Vaynex Inventory API

Enterprise-grade REST API platform with layered architecture, MySQL stored procedures, and Swagger documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Demo Credentials

```
Email: admin@yahoo.com
Password: admin@123
```

## API Documentation

Once running, access Swagger UI at:
```
http://localhost:3000/api-docs
```

## Project Structure

```
src/
├── core/           # Shared modules (auth, database, logging)
├── projects/       # Independent project modules
│   ├── auth/       # Authentication API
│   └── inventory/  # Inventory management API
└── swagger/        # API documentation config
```

## Key Features

- **Token-based Authentication**: JWT with bearer tokens
- **Stored Procedures**: All database operations via MySQL SPs
- **Layered Architecture**: Controller → Service → Model
- **Centralized Error Handling**: MySQL and API exceptions
- **Swagger Documentation**: Interactive API testing

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_secret
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### Inventory
- `GET /api/v1/inventory/items` - List items
- `POST /api/v1/inventory/items` - Create item
- `GET /api/v1/inventory/items/:id` - Get item
- `PUT /api/v1/inventory/items/:id` - Update item
- `DELETE /api/v1/inventory/items/:id` - Delete item
