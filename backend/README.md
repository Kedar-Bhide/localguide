# LocalGuide Backend API

A Node.js/Express.js backend API for the LocalGuide platform, connecting travelers with local experts.

## Features

- **Authentication**: JWT-based authentication with email/password
- **User Management**: Profile management for travelers and locals
- **Local Expert System**: Create and manage local expert profiles
- **Search & Discovery**: Find local experts by location and tags
- **Real-time Chat**: Socket.IO powered messaging between travelers and locals
- **Security**: Rate limiting, input validation, secure headers
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcrypt
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route definitions
│   ├── utils/           # Utilities and helpers
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase project with database setup

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your Supabase credentials and other config values

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/me` - Get current user info

### Local Experts
- `POST /api/locals/profile` - Create local expert profile
- `PUT /api/locals/profile` - Update local expert profile
- `GET /api/locals/search` - Search local experts
- `GET /api/locals/:id` - Get local expert by ID
- `GET /api/locals/nearby` - Get nearby local experts
- `GET /api/locals/cities` - Get cities with local experts

### Chat System
- `POST /api/chats` - Create or find chat
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message
- `PUT /api/chats/:id/read` - Mark messages as read
- `DELETE /api/chats/:id` - Archive chat

### Health Check
- `GET /api/health` - Health check endpoint

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- Rate limiting on all endpoints
- JWT token authentication
- Input validation and sanitization
- Security headers with Helmet
- CORS configuration
- Bcrypt password hashing
- SQL injection prevention via Supabase

## Socket.IO Events

- `join` - Join user's personal room
- `joinChat` - Join specific chat room
- `leaveChat` - Leave chat room
- `sendMessage` - Send message to chat
- `newMessage` - Receive new message
- `typing` - User typing indicator
- `userTyping` - Broadcast typing status
- `stopTyping` - Stop typing
- `userStoppedTyping` - Broadcast stopped typing

## Contributing

1. Follow TypeScript best practices
2. Use proper error handling
3. Add appropriate logging
4. Update tests for new features
5. Follow existing code style patterns