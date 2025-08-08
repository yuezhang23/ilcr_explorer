# ICLR Rating Application

A comprehensive web application for managing and analyzing ICLR (International Conference on Learning Representations) paper submissions, reviews, and predictions.

## Overview

This application provides a complete platform for:
- Managing ICLR paper submissions across multiple years (2024, 2025, 2026)
- User authentication and role-based access control
- Paper review and rating system with metareviews
- AI-powered prediction system for paper acceptance/rejection
- Public comments and likes system
- Advanced analytics and visualization dashboards
- Global year management system

## Architecture

### Backend (Node.js + Express + MongoDB)
- **Framework**: Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom authentication system with role-based access
- **API**: RESTful API with comprehensive endpoints

### Frontend (React + TypeScript + Redux)
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with multiple reducers
- **Routing**: React Router v7
- **UI**: Bootstrap 5 with custom styling
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: FontAwesome and React Icons

## Features

### 🔐 Authentication & User Management
- User registration and login system
- Role-based access control (USER, ADMIN, OWNER)
- Protected routes and session management
- User profile management
- Local storage-based authentication persistence

### 📊 Paper Management
- Multi-year support (2024, 2025, 2026) with global year system
- Paper search by title, abstract, author, and decision
- Random paper selection for review
- Pagination support for large datasets
- Paper ranking by ratings and likes

### 🤖 AI Prediction System
- Prompt-based prediction generation
- Support for rebuttal and non-rebuttal predictions
- Batch prediction processing
- Prediction accuracy tracking
- Template-based prompt management

### 💬 Social Features
- Public comments on papers
- Like/unlike functionality
- Comment modification and deletion
- User activity tracking

### 📈 Analytics & Visualization
- Rating distribution charts
- Confidence analysis
- Rebuttal vs non-rebuttal comparison
- Prediction error analysis
- Leaderboard system
- Interactive dashboards

### 🎯 Global Year System
- Centralized year management
- Automatic collection switching
- Year validation (2024, 2025, 2026 only)
- Frontend year selector component

## Project Structure

```
iclr-rating-dev/
├── iclr-node-server-app/          # Backend server
│   ├── 01AuthenAuthor/           # Authentication & authorization
│   ├── 02ICLR/                   # Paper management
│   ├── 03PublicComments/         # Comments & likes system
│   ├── 04Users/                  # User management
│   ├── 05Prompt/                 # AI prediction system
│   ├── config/                   # Global configuration
│   └── data/                     # Data utilities
├── iclr-react-web-app/           # Frontend application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── contexts/             # React contexts
│   │   ├── Project/              # Main application
│   │   │   ├── Home/             # Dashboard & analytics
│   │   │   ├── User/             # User management
│   │   │   ├── Search/           # Search functionality
│   │   │   ├── Reducers/         # Redux reducers
│   │   │   └── store/            # Redux store
│   │   └── App.tsx               # Main app component
└── GLOBAL_YEAR_SYSTEM.md         # Year system documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd iclr-node-server-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following configuration:
   ```env
   DB_CONNECTION_STRING=mongodb://localhost:27017/iclr_2024
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd iclr-react-web-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/user/signup` - Register new user
- `POST /api/user/signin` - User login
- `POST /api/user/signout` - User logout
- `GET /api/user/profile/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `GET /api/users` - Get all users

### Paper Management
- `GET /api/iclr` - Get all papers
- `GET /api/iclr/random` - Get random papers
- `GET /api/iclr/search/:title` - Search papers by title
- `GET /api/iclr/author/:author` - Search papers by author
- `GET /api/iclr/abstract/:abstract` - Search papers by abstract
- `GET /api/iclr/decision/:decision` - Filter papers by decision
- `GET /api/iclr/pagination/:page/:limit` - Get papers with pagination
- `GET /api/iclr/ranking/rating/:count` - Get papers ranked by rating
- `GET /api/iclr/reviews/:userId` - Get reviews by user
- `GET /api/iclr/likes/:userId` - Get likes by user

### Year Management
- `POST /api/iclr/year` - Set current year
- `GET /api/iclr/year` - Get current year and available years

### Comments & Likes
- `POST /api/public/comments/like` - Like/unlike a paper
- `POST /api/public/comments/comment` - Add comment
- `DELETE /api/public/comments/comment` - Remove comment
- `PUT /api/public/comments/comment` - Modify comment
- `GET /api/public/comments/ranking/likes/:limit` - Get papers sorted by likes

### Predictions
- `POST /api/prompt/prediction` - Get prediction by paper ID and prompt
- `POST /api/prompt/predictions` - Get all predictions by prompt
- `POST /api/prompt/predictions/paper` - Get predictions by paper ID
- `POST /api/prompt/predictions/batch` - Get batch predictions
- `POST /api/prompt/predictions/rebuttal` - Get predictions with rebuttal support

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

### Paper Schema
```javascript
{
  title: String,
  authors: [String],
  abstract: String,
  decision: String,
  metareviews: [{
    rating: Number,
    confidence: Number,
    // ... other review fields
  }],
  // ... other paper fields
}
```

## Key Features

### Global Year System
The application supports multiple ICLR years (2024, 2025, 2026) with a centralized year management system that automatically switches database collections based on the selected year.

### Redux State Management
- **User Reducer**: Manages current user state
- **ICLR Reducer**: Handles paper data and collection names
- **Prediction Reducer**: Manages AI predictions and rebuttal data
- **Public Data Reducer**: Handles comments and likes
- **Prompt Template Reducer**: Manages prediction prompts

### Advanced Analytics
- Interactive rating distribution charts
- Confidence analysis with rebuttal comparison
- Prediction accuracy tracking
- User activity analytics
- Real-time data visualization

### Responsive Design
- Mobile-friendly interface
- Bootstrap-based responsive layout
- Custom styling with TypeScript
- Modern UI/UX patterns

## Development Scripts

### Backend
- `npm start` - Start the development server
- `npm test` - Run tests (placeholder)

### Frontend
- `npm start` - Start development server with optimizations
- `npm start:fast` - Start with additional performance optimizations
- `npm build` - Build for production
- `npm test` - Run tests

## Security Considerations

This application includes several security features:
- Input validation and sanitization
- Role-based access control
- Protected API endpoints
- Secure password handling
- CORS configuration

For production deployment, consider:
- Implementing HTTPS
- Adding rate limiting
- Enhanced password hashing
- JWT token management
- Database connection pooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For questions or issues, please refer to the project documentation or create an issue in the repository.
