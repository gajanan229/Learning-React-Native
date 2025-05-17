# ChronoFold Alarm App

ChronoFold is a comprehensive alarm application featuring a React Native (Expo) frontend and a Node.js (Express) backend, designed to provide a robust and user-friendly alarm management experience.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend-1)
  - [Backend](#backend-1)
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
  - [Backend](#backend-2)
  - [Frontend](#frontend-2)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Overview

The ChronoFold Alarm App allows users to create, manage, and organize alarms within customizable folders. It features a clean user interface, robust alarm scheduling, and notification capabilities. The application is architected with a separate frontend and backend, enabling scalability and maintainability.

## Features

### Frontend

-   **Alarm Management:** Create, edit, delete, and toggle alarms.
-   **Folder Organization:** Group alarms into folders for better management.
-   **Customizable Alarms:** Set time, label, sound, vibration, and snooze options.
-   **Recurrence:** Define recurrence for alarm folders (e.g., weekdays, weekends, daily).
-   **One-Time Alarms:** Option to set alarms that are deleted after dismissal.
-   **Sound Picker:** Choose from a list of available alarm sounds.
-   **Notifications:** Local push notifications for alarms.
-   **State Management:** Uses Zustand for efficient global state management.
-   **User Interface:** Modern and responsive UI built with React Native components, Lucide icons for iconography.
-   **Toast Notifications:** Provides user feedback for actions (success/error).
-   **Loading & Error States:** Clear indicators for data fetching and API interactions.

### Backend

-   **RESTful API:** Provides endpoints for managing alarms and folders.
-   **User Authentication (Implicit):** Endpoints are structured to be user-specific (user_id in tables). *Further details on user auth mechanism (e.g., JWT) would be good to add if implemented.*
-   **CRUD Operations:** Full support for Create, Read, Update, Delete operations for alarms and folders.
-   **Data Persistence:** Stores alarm and folder data in a PostgreSQL database.

## Tech Stack

### Frontend-1

-   **Framework:** React Native with Expo
-   **Language:** TypeScript
-   **Navigation:** Expo Router, React Navigation (Bottom Tabs, Material Top Tabs)
-   **State Management:** Zustand
-   **API Client:** Axios
-   **UI Components:** Custom components, Lucide React Native for icons
-   **Utilities:** `date-fns` for date/time manipulation, `expo-haptics`, `expo-notifications`
-   **Linting/Formatting:** ESLint (via `expo lint`), Prettier

### Backend-1

-   **Framework:** Node.js with Express.js
-   **Language:** JavaScript (ES Modules)
-   **Database ORM/Driver:** `pg` (Node.js PostgreSQL client)
-   **Middleware:** `cors`, `dotenv`
-   **Authentication:** `jsonwebtoken` (if fully implemented for user auth beyond table structure)
-   **Development:** `nodemon` for auto-reloading

### Database

-   **Type:** PostgreSQL
-   **Schema:** Includes tables for `folders` and `alarms` with relationships and relevant indices. (See `schema.sql` for details).

## Project Structure

The project is organized into two main directories: `Alarm_App_frontend/` and `Alarm_App_backend/`.

### Frontend Structure
Alarm_App_frontend/
### Frontend Structure (`Alarm_App_frontend/`)

Alarm_App_frontend/
├── app/                  # Expo Router: Screens and Layouts
│   ├── (auth)/           # Authentication flow group
│   │   ├── _layout.tsx   # Stack navigator layout for auth screens
│   │   ├── login.tsx     # Login screen
│   │   └── register.tsx  # Registration screen
│   ├── (tabs)/           # Main application tabs group (or `(app)/`)
│   │   ├── _layout.tsx   # Tab navigator layout
│   │   ├── index.tsx     # Home/Folder List screen (first tab)
│   │   ├── create-edit-alarm.tsx # Screen for creating/editing alarms (might be modal)
│   │   └── settings/     # Settings section
│   │       ├── _layout.tsx # Layout for settings (e.g., if using nested navigation)
│   │       ├── index.tsx   # Main settings screen (with Top Tabs)
│   │       ├── general.tsx # General settings tab content
│   │       └── folders.tsx # Folder management settings tab content
│   ├── _layout.tsx       # Root layout for the entire application
│   └── alarm-list.tsx    # Screen to list alarms for a specific folder (dynamic route like `folder/[folderId].tsx` or `alarm-list.tsx` and receives params)
│                           # (Note: Placement of alarm-list.tsx and create-edit-alarm.tsx depends on navigation strategy -
│                           #  they might be top-level routes outside `(tabs)` if pushed onto a stack or presented as modals)
├── assets/               # Static assets
│   ├── fonts/            # Custom font files (if not solely using expo-google-fonts)
│   ├── images/           # Icons, splash screen, logos, etc.
│   └── sounds/           # Default alarm sound files (if bundled)
├── components/           # Reusable UI Components
│   ├── alarm/            # Alarm-specific components (e.g., AlarmCard, AlarmForm, SoundPicker)
│   ├── folder/           # Folder-specific components (e.g., FolderCard, FolderForm)
│   └── ui/               # General UI elements (Button, Input, Modal, Card, ToggleSwitch, etc.)
├── constants/            # Application-wide constants
│   ├── theme.ts          # Colors, typography, spacing, etc.
│   └── index.ts          # Potentially exports all constants or other specific constants
├── hooks/                # Custom React Hooks (e.g., useCachedResources, useHaptics)
├── services/             # API Service Integrations
│   ├── authService.ts    # For existing authentication backend
│   ├── alarmApiClient.ts # Axios client for the new Alarm App Backend
│   ├── folderService.ts  # For folder CRUD operations via new backend
│   └── alarmService.ts   # For alarm CRUD operations via new backend
├── store/                # Zustand State Management Stores
│   ├── useAuthStore.ts   # Manages authentication state (token, user)
│   ├── useAlarmStore.ts  # Manages folder and alarm data, settings related to them
│   ├── useSettingsStore.ts # Manages general app settings (theme, defaults)
│   └── useSoundStore.ts  # Manages available sounds, current selection
├── types/                # TypeScript Type Definitions
│   └── index.ts          # Central file for custom types (Alarm, Folder, Day, UserDetails, etc.)
├── utils/                # Utility Functions
│   ├── notifications.ts  # Local notification scheduling and handling
│   ├── storage.ts        # AsyncStorage/SecureStore helpers (if generic ones are used)
│   └── ...               # Other helpers (formatters, validators)
├── .expo/                # Expo's cache and build files (ignored by Git)
├── .husky/               # (If using Husky for Git hooks - optional)
├── node_modules/         # Project dependencies (ignored by Git)
├── .env                  # Environment variables (EXPO_PUBLIC_... - ignored by Git)
├── .eslintignore         # Files to ignore for ESLint
├── .eslintrc.js          # ESLint configuration
├── .gitignore            # Specifies intentionally untracked files
├── .npmrc                # npm configuration (e.g., save-exact=true)
├── .prettierignore       # Files to ignore for Prettier
├── .prettierrc.js        # Prettier configuration (or .json, .yaml)
├── app.json              # Expo app configuration
├── babel.config.js       # Babel configuration
├── expo-env.d.ts         # TypeScript definitions for Expo environment variables
├── metro.config.js       # Metro bundler configuration (if customized)
├── package-lock.json     # Records exact versions of dependencies
├── package.json          # Project metadata, dependencies, and scripts
└── tsconfig.json         # TypeScript compiler configuration
### Backend Structure
### Backend Structure (`Alarm_App_backend/`)

Alarm_App_backend/
├── config/               # Configuration files
│   └── db.js             # PostgreSQL database connection setup
├── controllers/          # Business logic handlers for requests
│   ├── folderController.js
│   └── alarmController.js
├── middleware/           # Custom Express middleware
│   └── authMiddleware.js   # JWT protection middleware (verifies tokens)
├── models/               # Data access layer (database interactions)
│   ├── folderModel.js
│   └── alarmModel.js
├── routes/               # API route definitions
│   ├── folderRoutes.js
│   └── alarmRoutes.js
├── utils/                # Utility functions
│   └── tokenUtils.js     # JWT verification utilities (uses shared JWT_SECRET)
├── node_modules/         # Project dependencies (ignored by Git)
├── .env                  # Environment variables (PORT, DB_*, JWT_SECRET - ignored by Git)
├── .eslintignore         # (Optional)
├── .eslintrc.js          # (Optional) ESLint configuration
├── .gitignore            # Specifies intentionally untracked files
├── index.js              # Main application entry point for the server
├── package-lock.json     # Records exact versions of dependencies
└── package.json          # Project metadata, dependencies, and scripts

## Database Schema

The database schema defines two main tables: `folders` and `alarms`.

-   **`folders`**: Stores information about alarm folders, including `name`, `recurrence_days`, and `is_active` status.
-   **`alarms`**: Stores alarm details such as `time`, `label`, `sound_id`, `vibration`, `snooze` settings, and their active status, linked to a specific folder.

Both tables include `user_id` to associate data with specific users and timestamps for `created_at` and `updated_at`.

For detailed schema information, please refer to the `schema.sql` file in the `Alarm App/` root directory.

## Prerequisites

-   Node.js (v18.x or later recommended)
-   npm or yarn
-   Expo CLI (for frontend development): `npm install -g expo-cli`
-   PostgreSQL server installed and running.
-   Git

## Setup and Installation

### Backend Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-url>/Alarm App/Alarm_App_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `Alarm_App_backend/` directory and add your PostgreSQL database connection details and other necessary variables. Example:
    ```env
    DB_USER=your_db_user
    DB_HOST=localhost
    DB_DATABASE=your_alarm_app_db_name
    DB_PASSWORD=your_db_password
    DB_PORT=5432
    JWT_SECRET=your_jwt_secret_key # If using JWT for authentication
    PORT=3000 # Or any port you prefer for the backend
    ```

4.  **Set up the database:**
    -   Ensure your PostgreSQL server is running.
    -   Create the database specified in your `.env` file (e.g., `your_alarm_app_db_name`).
    -   Run the `schema.sql` script to create the necessary tables:
        ```bash
        psql -U your_db_user -d your_alarm_app_db_name -a -f ../schema.sql
        ```
        (Adjust the command based on your PostgreSQL setup and path to `schema.sql`.)

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../Alarm_App_frontend
    # (Assuming you are in Alarm_App_backend/ from the previous step)
    # Or from the project root:
    # cd <your-repository-url>/Alarm App/Alarm_App_frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure API endpoint:**
    Update the API base URL in `Alarm_App_frontend/services/alarmApiClient.ts` (or a similar configuration file) to point to your backend server (e.g., `http://localhost:3000/api` if your backend runs on port 3000 and routes are prefixed with `/api`).

    *Example `alarmApiClient.ts` modification:*
    ```typescript
    // In Alarm_App_frontend/services/alarmApiClient.ts
    import axios from 'axios';

    const apiClient = axios.create({
      baseURL: 'http://localhost:3000/api', // Ensure this matches your backend
      // ... other configurations
    });

    export default apiClient;
    ```

## Running the Application

### Backend-2

1.  **Navigate to the backend directory:**
    ```bash
    cd <path-to-project>/Alarm App/Alarm_App_backend
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will typically start the server using `nodemon` on the port specified in your `.env` file (e.g., `http://localhost:3000`).

3.  **Start the production server:**
    ```bash
    npm start
    ```

### Frontend-2

1.  **Navigate to the frontend directory:**
    ```bash
    cd <path-to-project>/Alarm App/Alarm_App_frontend
    ```

2.  **Start the Expo development server:**
    ```bash
    npm run dev
    # or
    expo start
    ```
    This will open the Expo DevTools in your browser. You can then:
    -   Scan the QR code with the Expo Go app on your Android or iOS device.
    -   Press `a` to run on an Android Emulator/Connected Device.
    -   Press `i` to run on an iOS Simulator/Connected Device.
    -   Press `w` to run in a web browser.

## API Endpoints

The backend provides a RESTful API for managing alarms and folders. Key endpoint groups include:

-   **Folders:**
    -   `GET /api/folders`: Fetch all folders for the authenticated user.
    -   `POST /api/folders`: Create a new folder.
    -   `GET /api/folders/:folderId`: Get a specific folder.
    -   `PUT /api/folders/:folderId`: Update a folder.
    -   `DELETE /api/folders/:folderId`: Delete a folder.
-   **Alarms:**
    -   `GET /api/folders/:folderId/alarms`: Get all alarms in a specific folder.
    -   `POST /api/folders/:folderId/alarms`: Create a new alarm in a folder.
    -   `GET /api/alarms/:alarmId`: Get a specific alarm.
    -   `PUT /api/alarms/:alarmId`: Update an alarm.
    -   `DELETE /api/alarms/:alarmId`: Delete an alarm.

*(Note: The exact base path `/api` might vary based on your backend routing configuration. User authentication details for these endpoints should be documented if applicable, e.g., how `user_id` is handled via JWTs or session.)*


