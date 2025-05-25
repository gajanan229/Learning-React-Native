# ToDo App Project

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
  - [Core Features](#core-features)
  - [User Management Features](#user-management-features)
  - [Task Organization Features](#task-organization-features)
  - [Backend Features](#backend-features)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
- [Project Structure](#project-structure)
  - [Frontend Structure](#frontend-structure)
  - [Backend Structure](#backend-structure)
- [Database Schema](#database-schema)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
  - [Backend](#backend-1)
  - [Frontend](#frontend-1)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
  - [Backend (.env)](#backend-env)
  - [Frontend (.env)](#frontend-env)
- [Authentication Flow](#authentication-flow)
- [Available Scripts](#available-scripts)
  - [Backend](#backend-2)
  - [Frontend](#frontend-2)
- [Contributing](#contributing)
- [License](#license)

## Project Description

The ToDo App is a comprehensive task management application designed for users who need to organize their daily tasks efficiently. Built as a full-stack solution, it features a React Native (Expo) frontend for a seamless mobile experience and a robust Node.js (Express) backend with PostgreSQL for reliable data storage. The application supports user authentication, task organization through folders, priority management, and due date tracking.

## Features

### Core Features
- **Task Management:** Create, edit, delete, and mark tasks as complete/incomplete.
- **Task Details:** Add descriptions, set priority levels (low, medium, high), and assign due dates.
- **Real-time Updates:** Instant synchronization of task status changes across the interface.
- **Search and Filter:** Find tasks quickly with search functionality and filter by completion status, priority, or folder.

### User Management Features
- **User Authentication:** Secure registration and login system using JWT tokens.
- **Protected Routes:** Middleware-protected API endpoints ensuring user data privacy.
- **Session Management:** Persistent login sessions with secure token storage.
- **User Profiles:** Individual user accounts with isolated task data.

### Task Organization Features
- **Folder System:** Organize tasks into custom folders for better categorization.
- **Folder Management:** Create, rename, and delete folders to suit your workflow.
- **Default Organization:** Tasks can exist without folders for simple, flat organization.
- **Visual Organization:** Clean, intuitive interface for managing tasks within folders.

### Backend Features
- **RESTful API:** Well-structured API endpoints for all task and folder operations.
- **Data Validation:** Server-side validation for all user inputs and data integrity.
- **Error Handling:** Comprehensive error handling with meaningful error messages.
- **Database Optimization:** Indexed database queries for optimal performance.
- **CORS Support:** Cross-origin resource sharing configured for frontend-backend communication.

## Tech Stack

### Frontend
- **React Native:** Cross-platform mobile application development framework.
- **Expo:** Development platform and framework for universal React applications.
- **Expo Router:** File-system based routing for React Native applications.
- **TypeScript:** Type-safe JavaScript superset for enhanced development experience.
- **NativeWind:** Tailwind CSS implementation for React Native styling.
- **Zustand:** Lightweight state management library for global application state.
- **Axios:** Promise-based HTTP client for API communication.
- **Lucide React Native:** Modern icon library for consistent iconography.
- **React Navigation:** Navigation library for tab and stack navigation.
- **Expo Secure Store:** Secure storage for authentication tokens.

### Backend
- **Node.js:** JavaScript runtime environment for server-side development.
- **Express.js:** Fast, unopinionated web framework for Node.js.
- **PostgreSQL:** Advanced open-source relational database system.
- **pg (node-postgres):** PostgreSQL client for Node.js applications.
- **JSON Web Token (jsonwebtoken):** Secure token-based authentication system.
- **Helmet:** Security middleware for Express applications.
- **CORS:** Cross-Origin Resource Sharing middleware.
- **dotenv:** Environment variable management.
- **ES6 Modules:** Modern JavaScript module system.

### Database
- **PostgreSQL:** Primary database system with advanced indexing and performance optimization.

## Project Structure

The project is organized into two main directories:

### Frontend Structure (`ToDo_App_frontend/`)
```
ToDo_App_frontend/
├── app/                     # Expo Router: Application routes and layouts
│   ├── (auth)/              # Authentication flow group
│   │   ├── _layout.tsx      # Stack navigator layout for auth screens
│   │   ├── login.tsx        # User login screen
│   │   └── register.tsx     # User registration screen
│   ├── (tabs)/              # Main application tabs group
│   │   ├── _layout.tsx      # Tab navigator layout
│   │   ├── index.tsx        # Home/Folder List screen (first tab)
│   │   └── settings.tsx     # Application settings screen
│   ├── Create/              # Task and folder creation screens
│   ├── folder/              # Folder-specific screens and routes
│   ├── _layout.tsx          # Root layout for the entire application
│   └── +not-found.tsx       # 404 error screen
├── assets/                  # Static assets               
├── components/              # Reusable UI Components
│   ├── common/              # Shared components across the app
│   ├── folders/             # Folder-specific components
│   ├── tasks/               # Task-specific components
│   ├── modals/              # Modal dialog components
│   └── ui/                  # General UI elements (Button, TextField, etc.)
├── contexts/                # React Context providers
├── hooks/                   # Custom React hooks
├── services/                # API service integrations
├── store/                   # Zustand state management stores
├── types/                   # TypeScript type definitions
├── .expo/                   # Expo cache and build files (ignored by Git)
├── node_modules/            # Project dependencies (ignored by Git)
├── .env                     # Environment variables (ignored by Git)
├── .gitignore               # Git ignore configuration
├── app.json                 # Expo app configuration
├── babel.config.js          # Babel configuration
├── expo-env.d.ts            # Expo TypeScript definitions
├── nativewind-env.d.ts      # NativeWind TypeScript definitions
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript compiler configuration
```

### Backend Structure (`ToDo_App_backend/`)
```
ToDo_App_backend/
├── config/                  # Configuration files
│   └── db.js                # PostgreSQL database connection setup
├── controllers/             # Business logic handlers for requests
│   ├── folderController.js  # Folder management logic
│   └── taskController.js    # Task management logic
├── middleware/              # Custom Express middleware
│   └── authMiddleware.js    # JWT authentication middleware
├── models/                  # Data access layer (database interactions)
│   ├── folderModel.js       # Folder database operations
│   └── taskModel.js         # Task database operations
├── routes/                  # API route definitions
│   ├── folderRoutes.js      # Folder-related API endpoints
│   └── taskRoutes.js        # Task-related API endpoints
├── utils/                   # Utility functions
│   └── tokenUtils.js        # JWT token utilities
├── node_modules/            # Project dependencies (ignored by Git)
├── .env                     # Environment variables (ignored by Git)
├── .gitignore               # Git ignore configuration
├── index.js                 # Main application entry point
├── package.json             # Project dependencies and scripts
└── package-lock.json        # Dependency lock file
```

## Database Schema

The PostgreSQL database consists of two main tables designed for efficient task and folder management:

### Tables

- **`todo_folders`**: Stores user-created folders for task organization
  - `id`: Primary key (auto-increment)
  - `user_id`: Foreign key referencing users table
  - `name`: Folder name (unique per user)
  - `created_at`: Timestamp of folder creation
  - `updated_at`: Timestamp of last modification

- **`tasks`**: Stores individual task information
  - `id`: Primary key (auto-increment)
  - `user_id`: Foreign key referencing users table
  - `folder_id`: Optional foreign key referencing todo_folders table
  - `title`: Task title/name
  - `description`: Optional detailed task description
  - `completed`: Boolean flag for task completion status
  - `priority`: Enum value ('low', 'medium', 'high')
  - `due_date`: Optional due date with timezone support
  - `created_at`: Timestamp of task creation
  - `updated_at`: Timestamp of last modification

### Indexes

The database includes optimized indexes for:
- User-specific queries on both tables
- Folder-based task lookups
- Task completion status filtering
- Due date sorting and filtering

For the complete schema definition, refer to the `schema.sql` file in the project root.

## Prerequisites

- **Node.js** (v18.x or later recommended)
- **npm** or **yarn** package manager
- **Expo CLI**: `npm install -g expo-cli`
- **PostgreSQL** server (version 12.x or later) installed and running
- **Expo Go** app on your mobile device (for testing) or Android/iOS emulator
- Git version control system

## Setup and Installation

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <your-repository-url>/ToDo_App/ToDo_App_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up PostgreSQL Database:**
   - Ensure your PostgreSQL server is running
   - Create a new database (e.g., `todo_app_db`)
   - Connect to your database using `psql` or a GUI client
   - Execute the SQL commands in the `schema.sql` file:
     ```bash
     psql -U your_db_user -d todo_app_db -a -f ../schema.sql
     ```

4. **Configure Environment Variables:**
   Create a `.env` file in the `ToDo_App_backend/` directory:
   ```env
   PORT=3003
   DB_USER=your_postgres_user
   DB_HOST=localhost
   DB_DATABASE=todo_app_db
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   JWT_SECRET=your_very_strong_jwt_secret_key
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../ToDo_App_frontend
   # Or from the project root:
   # cd <your-repository-url>/ToDo_App/ToDo_App_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `ToDo_App_frontend/` directory:
   ```env
   EXPO_PUBLIC_TODO_BACKEND_URL=http://localhost:3003
   ```
   
   **Note:** Replace `localhost` with your computer's IP address if testing on a physical device.

## Running the Application

### Backend

1. **Navigate to the backend directory:**
   ```bash
   cd <path-to-project>/ToDo_App/ToDo_App_backend
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   This starts the server with nodemon for automatic restarts on file changes.

3. **Start the production server:**
   ```bash
   npm start
   ```

The server will start on the port specified in your `.env` file (default: http://localhost:3003).

### Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd <path-to-project>/ToDo_App/ToDo_App_frontend
   ```

2. **Start the Expo development server:**
   ```bash
   npm run dev
   # or
   npx expo start
   ```

## API Endpoints

The backend provides a RESTful API with the following main endpoint groups:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user details (protected)

### Folders
- `GET /api/folders` - Get all user folders
- `POST /api/folders` - Create a new folder
- `GET /api/folders/:folderId` - Get specific folder details
- `PUT /api/folders/:folderId` - Update folder information
- `DELETE /api/folders/:folderId` - Delete a folder

### Tasks
- `GET /api/tasks` - Get all user tasks (with optional folder filtering)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:taskId` - Get specific task details
- `PUT /api/tasks/:taskId` - Update task information
- `DELETE /api/tasks/:taskId` - Delete a task
- `PATCH /api/tasks/:taskId/toggle` - Toggle task completion status

**Note:** All folder and task endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Environment Variables

### Backend (.env)
```env
PORT=3003                           # Backend server port
DB_USER=your_postgres_user          # PostgreSQL username
DB_HOST=localhost                   # PostgreSQL host
DB_DATABASE=todo_app_db            # PostgreSQL database name
DB_PASSWORD=your_postgres_password  # PostgreSQL password
DB_PORT=5432                       # PostgreSQL port
JWT_SECRET=your_jwt_secret_key     # JWT signing secret (keep secure!)
```

### Frontend (.env)
```env
EXPO_PUBLIC_TODO_BACKEND_URL=http://localhost:3003  # Backend API base URL
```

**Important:** For physical device testing, replace `localhost` with your computer's local network IP address (e.g., `http://192.168.1.100:3003`).

## Authentication Flow

1. **User Registration/Login:** Users register or log in through the frontend authentication screens.
2. **JWT Issuance:** Backend generates and returns a JSON Web Token upon successful authentication.
3. **Token Storage:** Frontend securely stores the JWT using Expo Secure Store.
4. **API Requests:** All protected API calls include the JWT in the `Authorization` header.
5. **Token Verification:** Backend middleware verifies the JWT and extracts user information for request processing.
6. **Data Isolation:** All database queries are filtered by the authenticated user's ID to ensure data privacy.

## Available Scripts

### Backend
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm install      # Install dependencies
```

### Frontend
```bash
npm run dev      # Start Expo development server
npm run build:web # Build for web deployment
npm run lint     # Run ESLint code linting
npm install      # Install dependencies
```

---

**Note:** This ToDo App is designed as a learning project demonstrating full-stack mobile application development with React Native, Node.js, and PostgreSQL. It showcases modern development practices including TypeScript, state management, secure authentication, and responsive mobile UI design. 