# Calendar App

## Description
A full-stack calendar application built with React Native (Expo) for the frontend and Node.js/Express.js with PostgreSQL for the backend. It allows users to manage their events, view them in a monthly calendar, and see daily event lists. Authentication (user registration and login) is handled by a separate, shared user authentication service (e.g., Movie App backend), and this Calendar backend uses JWTs for authorization.

## Features

**Frontend (`Calendar_App_frontend/`)**
*   User registration and login (via a shared authentication service).
*   Secure JWT-based session management for calendar operations.
*   Interactive monthly calendar view with highlighted days that have events.
*   Display of a list of events for a selected day.
*   Ability to create, view, update, and delete personal events.
*   Neumorphic UI design elements for a modern look and feel.
*   Persistent event storage through the backend API.
*   Settings page with a functional logout option.
*   State management using Zustand for authentication (`useAuthStore`) and events (`useEventStore`).

**Backend (`Calendar_App_backend/`)**
*   RESTful API for managing calendar events.
*   Full CRUD (Create, Read, Update, Delete) operations for events.
*   Protected API routes using JWT middleware to ensure only authenticated users can manage their events.
*   PostgreSQL database integration for storing event data.
*   Centralized error handling middleware.
*   ES Modules support (`"type": "module"` in `package.json`).

## Tech Stack

**Frontend:**
*   React Native
*   Expo SDK
*   TypeScript
*   React Navigation (for routing)
*   Zustand (for global state management)
*   Axios (for HTTP requests to the backend)
*   Custom UI components with Neumorphic design influences

**Backend:**
*   Node.js
*   Express.js
*   PostgreSQL (with `pg` library for Node.js)
*   JSON Web Tokens (JWT) for request authorization
*   `dotenv` for environment variable management
*   `cors` for enabling Cross-Origin Resource Sharing
*   ES Modules

## Prerequisites
*   Node.js (v18.x or later recommended)
*   npm (Node Package Manager, typically comes with Node.js) or yarn
*   Expo CLI: `npm install -g expo-cli`
*   PostgreSQL server (version 12.x or later recommended) installed and running.
*   A separate, configured backend service for user authentication (e.g., Movie App backend) that issues JWTs.

## Setup and Installation

### Backend (`Calendar_App_backend/`)

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-url>/Calendar_App/Calendar_App_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up PostgreSQL Database:**
    *   Ensure your PostgreSQL server is running.
    *   Create a new database (e.g., `calendar_app_db`).
    *   Connect to your database using a tool like `psql` or a GUI client (e.g., pgAdmin, DBeaver).
    *   Run the following SQL script to create the `events` table:
        ```sql
        CREATE TABLE events (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL, -- This ID comes from the JWT issued by the auth service
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE NOT NULL,
            color VARCHAR(7) DEFAULT '#007AFF', -- Example: hex color code
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ```
    *   **Note:** The `users` table and user creation are managed by the external authentication service. This backend relies on the `user_id` provided in the JWT payload.

4.  **Configure Environment Variables:**
    Create a `.env` file in the `Calendar_App_backend/` directory and populate it with your specific configurations:
    ```env
    DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME"
    PORT=3002 # Or any other port you prefer for the calendar backend
    JWT_SECRET="YOUR_SHARED_JWT_SECRET" # This MUST be the same secret key used by your authentication service (Movie App backend)
    ```
    Replace `YOUR_DB_USER`, `YOUR_DB_PASSWORD`, `YOUR_DB_HOST`, `YOUR_DB_PORT`, `YOUR_DB_NAME`, and `YOUR_SHARED_JWT_SECRET` with your actual values.

5.  **Ensure ES Module Support:**
    Verify that your `Calendar_App_backend/package.json` includes `"type": "module"`:
    ```json
    {
      // ... other configurations ...
      "type": "module"
      // ...
    }
    ```

6.  **Run the backend server:**
    To start the server:
    ```bash
    npm start
    ```
    If you have a development script (e.g., using `nodemon`):
    ```bash
    npm run dev
    ```
    The server should start, and you should see a confirmation message like "Server running on port 3002" and "Database connected".

### Frontend (`Calendar_App_frontend/`)

1.  **Navigate to the frontend directory:**
    From the root of the cloned repository:
    ```bash
    cd ../Calendar_App_frontend
    # Or from the repository root:
    # cd <your-repository-url>/Calendar_App/Calendar_App_frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    Or if you use yarn:
    ```bash
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `Calendar_App_frontend/` directory. This file is used by Expo to expose variables to your application build.
    ```env
    EXPO_PUBLIC_CALENDAR_BACKEND_URL="http://localhost:3002" # URL of your Calendar_App_backend
    ```
    *   **Important for Authentication:** Ensure that the URL for your separate authentication service (e.g., `EXPO_PUBLIC_MOVIE_BACKEND_URL` or similar, if it's configurable via `.env`) is correctly set up in your authentication API client or relevant configuration files within the frontend. The login and registration screens depend on this.

4.  **Run the application:**
    ```bash
    npx expo start
    ```
    This command starts the Metro Bundler. You can then run the app on:
    *   An Android emulator or connected device (press `a` in the Metro Bundler terminal).
    *   An iOS simulator or connected device (press `i`).
    *   In a web browser (press `w`).

## Project Structure

**`Calendar_App_backend/`**
```
.
├── config/ # Database connection setup (db.js)
├── controllers/ # Route handlers/logic (eventController.js)
├── middleware/ # Custom middleware (authMiddleware.js, errorHandler.js)
├── models/ # Database interaction logic (eventModel.js)
├── routes/ # API route definitions (eventRoutes.js)
├── utils/ # Utility functions (e.g., tokenUtils.js)
├── .env # Environment variables (gitignored)
├── index.js # Main application entry point for the server
└── package.json # Project dependencies and scripts
```
**`Calendar_App_frontend/`**
```
.
├── app/ # Expo Router based routing structure
│ ├── (auth)/ # Screens and layout for authentication flow
│ │ ├── layout.tsx # Layout for auth stack
│ │ ├── login.tsx # Login screen
│ │ └── register.tsx # Registration screen
│ ├── (tabs)/ # Screens and layout for main app (post-login)
│ │ ├── layout.tsx # Layout for tab navigator
│ │ ├── index.tsx # Main calendar/event display screen
│ │ └── settings.tsx # Settings screen
│ ├── event/
│ │ └── create.tsx # Screen for creating/editing events
│ └── layout.tsx # Root layout component (handles providers, auth state)
├── assets/ # Static assets (images, fonts, etc.)
├── components/ # Reusable React components
│ ├── calendar/ # Calendar-specific components (MonthView.tsx, DailyEvents.tsx)
│ └── ui/ # General UI elements (NeumorphicView.tsx, Button.tsx, TextField.tsx etc.)
├── constants/ # Global constants (Colors.ts, Theme.ts, etc.)
├── hooks/ # Custom React Hooks (e.g., useEvents.tsx)
├── services/ # API client services (calendarApiClient.ts)
├── store/ # Zustand state management stores (useAuthStore.ts, useEventStore.ts)
├── .env # Environment variables for Expo (gitignored)
├── app.json # Expo configuration file
└── package.json # Project dependencies and scripts
```

## API Endpoints (`Calendar_App_backend/`)

All event-related endpoints require a JWT Bearer Token in the `Authorization` header.
Base URL is typically `http://localhost:3002` (or as configured in `PORT`).

*   **Health Check:**
    *   `GET /`
        *   Description: Checks if the server is running.
        *   Response: `200 OK` with JSON `{"message": "Calendar API is healthy"}`

*   **Events (`/api/events`):**
    *   `POST /api/events`
        *   Description: Create a new event for the authenticated user.
        *   Body (JSON):
            ```json
            {
              "title": "Team Meeting",
              "description": "Discuss project milestones.",
              "startTime": "2024-08-15T10:00:00.000Z",
              "endTime": "2024-08-15T11:00:00.000Z",
              "color": "#FF5733" // Optional
            }
            ```
        *   Response: `201 Created` with the created event object.

    *   `GET /api/events`
        *   Description: Get all events for the authenticated user.
        *   Response: `200 OK` with an array of event objects.

    *   `GET /api/events/:id`
        *   Description: Get a specific event by its ID. The event must belong to the authenticated user.
        *   Params: `id` (event ID)
        *   Response: `200 OK` with the event object or `404 Not Found`.

    *   `PUT /api/events/:id`
        *   Description: Update an existing event by its ID. The event must belong to the authenticated user.
        *   Params: `id` (event ID)
        *   Body (JSON): (Fields are optional; only provided fields will be updated)
            ```json
            {
              "title": "Updated Team Meeting",
              "description": "Updated agenda.",
              "startTime": "2024-08-15T10:30:00.000Z"
            }
            ```
        *   Response: `200 OK` with the updated event object or `404 Not Found`.

    *   `DELETE /api/events/:id`
        *   Description: Delete an event by its ID. The event must belong to the authenticated user.
        *   Params: `id` (event ID)
        *   Response: `200 OK` with a success message or `204 No Content`, or `404 Not Found`.

## Authentication Flow
1.  **User Registration/Login:** The user registers or logs in using the frontend screens (`register.tsx`, `login.tsx`). These screens communicate with a **separate, external authentication backend** (e.g., Movie App backend).
2.  **JWT Issuance:** Upon successful authentication, the external auth backend issues a JSON Web Token (JWT).
3.  **JWT Storage:** The frontend securely stores this JWT (e.g., using `expo-secure-store` via `useAuthStore`).
4.  **API Requests to Calendar Backend:** For all requests to the `Calendar_App_backend`'s `/api/events` endpoints, the frontend includes the JWT in the `Authorization` header as a Bearer token: `Authorization: Bearer <YOUR_JWT>`.
5.  **Backend Authorization:** The `Calendar_App_backend` uses `authMiddleware.js` to verify the JWT. This middleware checks the token's signature using the shared `JWT_SECRET`. If valid, it extracts user information (specifically `user_id`) from the token payload and attaches it to the request object (e.g., `req.user`). This `user_id` is then used in database queries to ensure users can only access and manage their own events.

## Environment Variables Summary

**Backend (`Calendar_App_backend/.env`):**
*   `DATABASE_URL`: Full PostgreSQL connection string.
    *   Example: `postgresql://postgres:password@localhost:5432/calendar_app_db`
*   `PORT`: Port for the backend server.
    *   Example: `3002`
*   `JWT_SECRET`: Secret key for verifying JWTs. **Crucially, this must be identical to the secret used by your primary authentication backend.**

**Frontend (`Calendar_App_frontend/.env`):**
*   `EXPO_PUBLIC_CALENDAR_BACKEND_URL`: Base URL for your `Calendar_App_backend`.
    *   Example: `http://localhost:3002`
*   `EXPO_PUBLIC_YOUR_AUTH_BACKEND_URL` (or similar, based on your setup): Base URL for your external authentication service. This is not directly used by the calendar backend but is essential for the frontend's login/registration functionality. Configure this within your frontend's API client for authentication.

## Key Scripts

**Backend (`Calendar_App_backend/`)**
*   Install dependencies:
    ```bash
    npm install
    ```
*   Start the server (production mode, or default start script):
    ```bash
    npm start
    ```
*   Start the server in development mode (if `nodemon` or similar is configured in `package.json`'s "dev" script):
    ```bash
    npm run dev
    ```

**Frontend (`Calendar_App_frontend/`)**
*   Install dependencies:
    ```bash
    npm install
    ```
*   Start the development server (Metro Bundler):
    ```bash
    npx expo start
    ```
*   Upgrade Expo SDK and dependencies:
    ```bash
    npx expo upgrade
    ```
*   Generate native `android` and `ios` project files (use if you need to write custom native code or before building standalone apps):
    ```bash
    npx expo prebuild
    ```
*   Run on Android device/emulator (after `npx expo prebuild` if it's the first time or native changes occurred):
    ```bash
    npx expo run:android
    ```
*   Run on iOS simulator/device (after `npx expo prebuild` if it's the first time or native changes occurred):
    ```bash
    npx expo run:ios
    ```



