# Brewery Rating App - Simplified Version

This is a simplified version of the brewery rating application with basic authentication and MongoDB data fetching.

## Overview

The application has been simplified by removing:
- Passport.js authentication
- JWT token management
- Complex password hashing
- Role-based route protection

## Features

- Simple user registration and login
- Basic user profile management
- MongoDB data fetching
- Paper review and rating system
- Public comments and likes

## Backend (Node.js + Express + MongoDB)

### Setup
1. Navigate to `brew-node-server-app`
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```
   DB_CONNECTION_STRING=mongodb://localhost:27017/iclr_2024
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the server: `npm start`

### API Endpoints

#### User Management
- `POST /api/user/signup` - Register new user
- `POST /api/user/signin` - User login
- `POST /api/user/signout` - User logout
- `GET /api/user/profile/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `GET /api/users` - Get all users

#### Paper Management
- `GET /api/iclr` - Get all papers
- `GET /api/iclr/random` - Get random papers
- `GET /api/iclr/search/:title` - Search papers by title
- `GET /api/iclr/author/:author` - Search papers by author

#### Comments and Likes
- `POST /api/public/comments/like` - Like/unlike a paper
- `POST /api/public/comments/comment` - Add comment
- `DELETE /api/public/comments/comment` - Remove comment
- `PUT /api/public/comments/comment` - Modify comment

## Frontend (React + TypeScript)

### Setup
1. Navigate to `brew-react-web-app`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Key Components

- **AuthContext**: Simple user state management using localStorage
- **ProtectedRoute**: Basic route protection
- **Signin/Signup**: User authentication forms
- **Profile**: User profile management
- **Home**: Main application interface
- **Search**: Paper search functionality

## Data Models

### User Schema
```javascript
{
  username: String (required, unique),
  password: String (required),
  firstName: String (required),
  lastName: String (required),
  email: String (required),
  dob: String,
  nickName: String (required),
  role: String (enum: ["ADMIN", "USER", "OWNER"]),
  description: String
}
```

## Authentication Flow

1. User registers or logs in
2. User data is stored in localStorage
3. User data is available throughout the app via AuthContext
4. No token management or complex authentication middleware

## Security Notes

This is a simplified version for development/demo purposes. For production use, consider:
- Implementing proper password hashing
- Adding JWT or session-based authentication
- Implementing role-based access control
- Adding input validation and sanitization
- Using HTTPS in production

## Running the Application

1. Start MongoDB
2. Start the backend: `cd brew-node-server-app && npm start`
3. Start the frontend: `cd brew-react-web-app && npm start`
4. Access the application at `http://localhost:3000` # ilcr_explorer
