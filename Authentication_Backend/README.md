# Authentication Backend

A lightweight, secure authentication backend service built with Node.js, Express, and PostgreSQL. This service provides JWT-based authentication with user registration, login, and profile management capabilities.

## Features

- **User Registration**: Secure user account creation with email validation
- **User Login**: JWT-based authentication system
- **Password Security**: Bcrypt password hashing for enhanced security
- **Token Management**: JWT token generation and validation
- **Profile Access**: Protected endpoint for user profile information
- **Database Integration**: PostgreSQL database with connection pooling
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling and logging
- **Environment Configuration**: Secure configuration management with dotenv

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **CORS**: cors middleware

## Prerequisites

Before running this service, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd Authentication_Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # Server Configuration
   PORT=3001

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   ```

4. **Set up the database**:
   ```bash
   # Connect to PostgreSQL and create your database
   psql -U postgres
   CREATE DATABASE your_database_name;

   # Run the schema.sql file to create the users table
   psql -U your_database_user -d your_database_name -f schema.sql
   ```

## Database Schema

The service uses a single `users` table with the following structure:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

Features:
- Auto-incrementing primary key
- Unique email constraint
- Optional username field
- Secure password hash storage
- Automatic timestamp management with triggers

## API Endpoints

### Base URL
```
http://localhost:3001/api/auth
```

### Endpoints

#### 1. User Registration
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "john_doe" // optional
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `409`: Email already in use

#### 2. User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials

#### 3. Get User Profile
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `401`: User not found

## Usage

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```
This starts the server in production mode.

The server will start on the port specified in your `.env` file (default: 3001).

## Project Structure

```
Authentication_Backend/
├── config/
│   └── db.js                 # Database connection configuration
├── controllers/
│   └── authController.js     # Authentication logic
├── middleware/
│   └── authMiddleware.js     # JWT token validation middleware
├── models/
│   └── userModel.js          # User database operations
├── routes/
│   └── authRoutes.js         # API route definitions
├── utils/
│   ├── hashUtils.js          # Password hashing utilities
│   └── tokenUtils.js         # JWT token utilities
├── index.js                  # Main application entry point
├── schema.sql                # Database schema
├── package.json              # Project dependencies and scripts
└── README.md                 # This file
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **SQL Injection Protection**: Parameterized queries prevent SQL injection
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Environment Variables**: Sensitive data stored in environment variables

## Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: Proper HTTP status codes for invalid input
- **Authentication Errors**: Clear messages for auth failures
- **Database Errors**: Graceful handling of database connection issues
- **Global Error Handler**: Catches and logs unexpected errors

---

**Note**: This is a development setup. For production deployment, consider additional security measures such as:
- Rate limiting
- HTTPS enforcement
- Database connection encryption
- Environment-specific CORS configuration
- Logging and monitoring solutions
