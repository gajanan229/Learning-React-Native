# Movie App Project

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
  - [Core Features](#core-features)
  - [User Account Features](#user-account-features)
  - [Movie Interaction Features](#movie-interaction-features)
  - [Social & Organization Features](#social--organization-features)
  - [Backend & Admin Features](#backend--admin-features)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
  - [1. Backend Setup (`Movie_app_backend`)](#1-backend-setup-movie_app_backend)
  - [2. Frontend Setup (`Movie_app`)](#2-frontend-setup-movie_app)
- [Database Schema Overview](#database-schema-overview)
- [API Endpoints Overview](#api-endpoints-overview)
- [Environment Variables](#environment-variables)
  - [Backend (`Movie_app_backend/.env`)](#backend-movie_app_backendenv)
  - [Frontend (`Movie_app/.env`)](#frontend-movie_appenv)
- [Available Scripts](#available-scripts)
  - [Backend](#backend-1)
  - [Frontend](#frontend-1)
- [License](#license)

## Project Description

The Movie App is a comprehensive mobile application designed for movie enthusiasts, developed as a learning project. It allows users to discover movies, track what they've watched, rate and review films, and organize movies into custom lists. The application features a React Native (Expo) frontend for a smooth mobile experience and a Node.js (Express) backend powering the API and database interactions.

## Features

### Core Features
*   **Movie Discovery:** Search for movies, view trending movies (placeholder, requires TMDB API or similar integration for live data).
*   **Detailed Movie Information:** View movie details including poster, title, overview, runtime, genres, budget, revenue, and production companies (fetched from TMDB API via backend).
*   **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens) and bcryptjs for password hashing.
*   **Protected Routes:** Middleware to protect user-specific backend routes.

### User Account Features
*   **User Profile:** Placeholder for user profile display.
*   **Profile Statistics:** View user-specific statistics like total movies watched, total runtime, favorite genres, etc.
*   **Logout Functionality.**
*   **"Me" Endpoint:** Allows frontend to verify token and get current user details.

### Movie Interaction Features
*   **Rate/Review Movies:**
    *   Add movies to a "watched" list.
    *   Rate movies on a star scale.
    *   Write and save textual reviews.
    *   Edit existing ratings and reviews.
    *   View watched status and user's rating/review on movie detail pages.
*   **Track Search Events:** Backend logs movie searches to identify trending movies.

### Social & Organization Features
*   **Movie Lists Management:**
    *   Automatic creation of "Watchlist" and "Favorites" system lists per user.
    *   Create custom movie lists with names and descriptions.
    *   View all user-created and system lists with movie counts.
    *   View detailed list pages showing all movies within a specific list.
    *   Add movies to any list (Watchlist, Favorites, Custom) from movie detail pages via a dedicated modal.
    *   Remove movies from lists.
    *   Update custom list names and descriptions.
    *   Delete custom lists.
*   **User List Previews:** "My Lists" screen shows previews of lists, including horizontally scrollable movie posters for movies within each list.

### Backend & Admin Features
*   **Centralized Database Connection.**
*   **Modular Route and Controller Structure.**
*   **ES6 Module Syntax.**
*   **Transactional Database Operations:** For complex actions like adding movies to lists (upserting movie details and then adding to list item table).
*   **Automated Timestamps:** `created_at` and `updated_at` fields automatically managed by PostgreSQL triggers.
*   **Data Cleanup Endpoint:** Placeholder for admin functionality to clean up old search events.

## Tech Stack

### Frontend (`Movie_app`)
*   **React Native:** Cross-platform mobile application development.
*   **Expo:** Framework and platform for universal React applications.
*   **Expo Router:** File-system based routing for React Native.
*   **TypeScript:** Superset of JavaScript for type safety.
*   **Tailwind CSS (NativeWind):** Utility-first CSS framework for styling.
*   **Axios:** Promise-based HTTP client for API requests.
*   **React Context API (`AuthContext`):** For global authentication state management.
*   **Expo Secure Store:** For securely storing JWT tokens.

### Backend (`Movie_app_backend`)
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **PostgreSQL:** Relational database.
*   **`pg` (node-postgres):** PostgreSQL client for Node.js.
*   **JSON Web Token (`jsonwebtoken`):** For generating and verifying JWTs.
*   **`bcryptjs`:** For hashing passwords.
*   **`dotenv`:** For managing environment variables.
*   **`cors`:** For enabling Cross-Origin Resource Sharing.
*   **ES6 Modules.**

### Database
*   **PostgreSQL**

## Project Structure

The project is organized into two main directories:

*   `Movie_app/`: Contains the React Native (Expo) frontend application.
    *   `app/`: Main application code, including routes (tabs, modals, movie details), screens.
    *   `assets/`: Static assets like images and fonts.
    *   `components/`: Reusable UI components.
    *   `constants/`: Global constants (e.g., icons, theme colors).
    *   `context/`: React Context API providers (e.g., `AuthContext`).
    *   `interfaces/`: TypeScript type definitions.
    *   `services/`: API interaction logic and data fetching services.
*   `Movie_app_backend/`: Contains the Node.js (Express) backend API.
    *   `config/`: Database connection configuration.
    *   `controllers/`: Request handling logic for different routes.
    *   `middleware/`: Custom middleware (e.g., authentication).
    *   `models/`: Database interaction logic (queries, data manipulation).
    *   `routes/`: API route definitions.
    *   `utils/`: Utility functions (e.g., hashing, token generation).
*   `schema.sql`: Contains the PostgreSQL database schema definition.

## Prerequisites

*   **Node.js** (LTS version recommended, e.g., v18.x or v20.x)
*   **npm** (comes with Node.js) or **Yarn**
*   **Expo Go** app on your mobile device (for testing the frontend) or an Android/iOS emulator/simulator.
*   **PostgreSQL** server installed and running.
*   A TMDB (The Movie Database) API Key for fetching movie data.

## Setup and Installation

### 1. Backend Setup (`Movie_app_backend`)

1.  **Navigate to the backend directory:**
    ```bash
    cd Movie_app_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up PostgreSQL Database:**
    *   Ensure your PostgreSQL server is running.
    *   Create a new database (e.g., `movie_app_db`).
    *   Connect to your database using `psql` or a GUI tool. Execute the SQL commands found in the `schema.sql` file located in the root of the `Movie_app_Project` directory. This will create the necessary tables, types, functions, and triggers.

4.  **Create Environment Variables File:**
    *   Create a `.env` file in the `Movie_app_backend` root directory.
    *   Add the following variables (see [Environment Variables](#backend-movie_app_backendenv) section for details):
        ```env
        PORT=3001
        DB_USER=your_postgres_user
        DB_HOST=localhost
        DB_DATABASE=movie_app_db
        DB_PASSWORD=your_postgres_password
        DB_PORT=5432
        JWT_SECRET=your_very_strong_jwt_secret
        ```

5.  **Start the backend server:**
    ```bash
    npm start
    # or
    # yarn start
    ```
    The server should typically start on `http://localhost:3001` (or the port specified in your `.env`).

### 2. Frontend Setup (`Movie_app`)

1.  **Navigate to the frontend directory:**
    ```bash
    cd Movie_app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Create Environment Variables File:**
    *   Create a `.env` file in the `Movie_app` root directory.
    *   Add the following variables (see [Environment Variables](#frontend-movie_appenv) section for details):
        ```env
        EXPO_PUBLIC_MOVIE_API_KEY=your_tmdb_api_key
        EXPO_PUBLIC_BACKEND_URL=http://localhost:3001 # Or your backend server's accessible URL
        ```
    *   **Note:** For TMDB API key, you need to register at [TMDB](https://www.themoviedb.org/documentation/api) to get one. The `EXPO_PUBLIC_` prefix is important for Expo projects to expose these variables to the client-side bundle.

4.  **Start the frontend development server:**
    ```bash
    npx expo start
    # or
    # yarn expo start
    ```
    This will open the Expo DevTools in your browser. You can then:
    *   Scan the QR code with the Expo Go app on your phone.
    *   Run on an Android emulator/simulator (press `a`).
    *   Run on an iOS simulator (press `i`).

## Database Schema Overview

The PostgreSQL database includes the following key tables:

*   `users`: Stores user credentials and profile information.
*   `movies`: Stores general movie details (TMDB ID, title, poster URL, etc.), acting as a cache.
*   `search_events`: Logs movie search occurrences to identify trending movies.
*   `user_watched_movies`: Tracks movies watched by users, including their ratings, reviews, and watch dates.
*   `user_lists`: Stores metadata for user-created movie lists (Watchlist, Favorites, Custom lists).
*   `user_list_items`: A join table linking movies to specific user lists.

All tables include `created_at` and `updated_at` timestamps, automatically managed by a database trigger. The full schema can be found in `schema.sql`.

## API Endpoints Overview

The backend exposes RESTful API endpoints under the `/api` prefix. Key route groups include:

*   `/api/auth`: User registration (`/register`) and login (`/login`), get current user (`/me`).
*   `/api/watched`: Manage user's watched movies (add/update, get all, get specific, remove).
*   `/api/profile`: Fetch user-specific profile statistics.
*   `/api/lists`: Manage user movie lists (create, get all, get details with movies, update, delete, add movie to list, remove movie from list).
*   `/api/searches`: Log movie search events.
*   `/api/movies/trending`: Get trending movies based on search events.
*   `/api/admin/cleanup`: (Placeholder) For administrative tasks.

## Environment Variables

### Backend (`Movie_app_backend/.env`)

*   `PORT`: Port for the backend server (e.g., `3001`).
*   `DB_USER`: PostgreSQL username.
*   `DB_HOST`: PostgreSQL server host (e.g., `localhost`).
*   `DB_DATABASE`: PostgreSQL database name.
*   `DB_PASSWORD`: PostgreSQL user password.
*   `DB_PORT`: PostgreSQL server port (e.g., `5432`).
*   `JWT_SECRET`: A strong, unique secret key for signing JWTs.

### Frontend (`Movie_app/.env`)

*   `EXPO_PUBLIC_MOVIE_API_KEY`: Your API key from The Movie Database (TMDB).
*   `EXPO_PUBLIC_BACKEND_URL`: The base URL of your running backend server (e.g., `http://localhost:3001` for local development, or your deployed backend URL. If using Expo Go on a physical device, this needs to be your computer's local network IP, e.g., `http://192.168.1.X:3001`).

## Available Scripts

### Backend (`Movie_app_backend`)

*   `npm start` or `yarn start`: Starts the backend development server (typically using `nodemon` if configured, or `node index.js`).


### Frontend (`Movie_app`)

*   `npx expo start` or `yarn expo start`: Starts the Expo development server.
*   `npx expo android` or `yarn expo android`: Starts the app on a connected Android device or emulator.
*   `npx expo ios` or `yarn expo ios`: Starts the app on an iOS simulator (macOS only).
*   `npx expo web` or `yarn expo web`: Starts the app in a web browser (if configured for web).


## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
(Create a `LICENSE` file in the root of `Movie_app_Project` with the MIT License text if you choose this license).

---