# Learning React Native - App Development Journey

A comprehensive collection of React Native applications built during my journey of learning mobile app development. This repository showcases the progression from following tutorials to building full-stack applications independently, demonstrating growth in React Native, backend development, and software architecture.

## Project Overview

This repository contains four distinct mobile applications, each representing a milestone in my React Native learning journey:

1. **Movie App** - Movie discovery and management platform
2. **Alarm App** - Customizable alarm management system  
3. **Calendar App** - Personal event and calendar management
4. **Todo App** - Task organization and productivity tool

Each application features a complete full-stack implementation with React Native (Expo) frontends and Node.js/Express backends using PostgreSQL databases.

## Applications

### 1. Movie App
**Learning Focus**: Tutorial-based development → Custom backend implementation

Started by following a [JavaScriptMastery YouTube tutorial](https://www.youtube.com/watch?v=f8Z9JyB2EIE&ab_channel=JavaScriptMastery) that covered frontend implementation using Appwrite as the backend. I then independently:
- Converted the backend to Node.js/Express with PostgreSQL
- Implemented JWT-based authentication system
- Added user profiles, movie lists, and rating/review functionality
- Learned TMDB API integration and data management

**Key Technologies**: React Native, Expo, TMDB API, Node.js, Express, PostgreSQL, JWT Authentication

### 2. Alarm App
**Learning Focus**: Independent full-stack development

My first completely self-developed application, focusing on alarm management with folder organization. This project challenged me to:
- Design database schemas from scratch
- Implement local notifications and alarm scheduling
- Create custom UI components and state management
- Handle complex time-based operations

**Key Technologies**: React Native, Expo Notifications, Zustand, Date/Time manipulation, Custom UI components

*Note: This app contains some bugs and is still a work in progress, representing the natural learning curve of independent development.*

### 3. Calendar App  
**Learning Focus**: Microservices architecture and authentication integration

Built upon lessons learned from previous projects, this app features:
- Integration with external authentication services
- Improved database design and API structure
- Enhanced UI/UX with neumorphic design elements
- Better error handling and state management

**Key Technologies**: React Native, Expo Router, JWT integration, Advanced PostgreSQL operations, Neumorphic UI design

### 4. Todo App
**Learning Focus**: Advanced features and polished user experience

The most sophisticated application in the collection, featuring:
- Complex task organization with folders and priorities
- Advanced search and filtering capabilities
- Comprehensive CRUD operations
- Production-ready code quality and documentation

**Key Technologies**: React Native, TypeScript, NativeWind (Tailwind CSS), Advanced state management, Optimized database queries

## Architecture

### Shared Authentication Backend
All applications utilize a centralized authentication service that can be deployed separately or integrated into individual app backends. This microservices approach demonstrates:

- **Separation of Concerns**: Authentication logic isolated from application-specific features
- **Reusability**: Single auth service supports multiple applications
- **Scalability**: Each service can be scaled independently
- **Modularity**: Easy integration by adding auth routes to existing backends

### Integration Options

**Standalone Deployment**: Each app with its dedicated backend + shared auth service

**Integrated Deployment**: Combine all services into a single backend by:
1. Moving authentication routes to the target backend
2. Adding auth imports: `import authRoutes from './routes/authRoutes.js';`
3. Registering routes: `app.use('/api/auth', authRoutes);`
4. Updating frontend environment variables to point to the unified backend

## Learning Progression

### Technical Skills Developed
- **React Native & Expo**: Mobile app development fundamentals
- **TypeScript**: Type safety and better development experience  
- **State Management**: From React Context to Zustand
- **Backend Development**: Node.js, Express.js, RESTful APIs
- **Database Design**: PostgreSQL, schema design, query optimization
- **Authentication**: JWT tokens, secure authentication flows
- **API Integration**: Third-party services (TMDB API)
- **UI/UX Design**: Custom components, responsive design, modern UI patterns

### Software Engineering Practices
- **Version Control**: Git workflows and project organization
- **Documentation**: Comprehensive README files and code comments
- **Error Handling**: Graceful error management and user feedback
- **Security**: Secure authentication, environment variable management
- **Testing**: API testing and integration validation
- **Deployment**: Backend deployment and environment configuration

## Technologies Used

### Frontend
- **React Native** with **Expo** framework
- **TypeScript** for type safety
- **Expo Router** for navigation
- **NativeWind** (Tailwind CSS for React Native)
- **Zustand** for state management
- **Axios** for API communication

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** and security middleware

## Repository Structure

```
Learning-React-Native/
├── Movie_app_Project/          # Movie discovery app
├── Alarm App/                  # Alarm management app
├── Calendar_App/               # Calendar and events app
├── ToDo_App/                   # Task management app
├── Authentication_Backend/     # Shared auth service
└── README.md                   # This file
```

Each application directory contains:
- Detailed README with setup instructions
- Frontend React Native application
- Backend Node.js/Express API
- Database schema definitions
- Environment configuration examples

## Key Learnings

This learning journey demonstrated the evolution from tutorial-following to independent full-stack development:

1. **Foundation Building**: Starting with guided tutorials to understand React Native fundamentals
2. **Backend Transition**: Moving from BaaS (Appwrite) to custom backend implementation
3. **Independent Development**: Building applications from scratch with increasing complexity
4. **Architecture Understanding**: Designing scalable, modular systems with shared services
5. **Production Considerations**: Implementing proper error handling, security, and documentation

## Getting Started

Each application includes comprehensive setup instructions in its respective README file. Generally, you'll need:

- Node.js (v18+)
- PostgreSQL
- Expo CLI
- Mobile device or emulator for testing

---

**Note**: This repository represents a learning journey in mobile app development. While the applications demonstrate various concepts and technologies, they are primarily educational projects showcasing growth and skill development in React Native and full-stack development.
