# User Relationship & Hobby Network

## Overview
A full-stack interactive social network application that visualizes user relationships and hobbies as a dynamic graph. Built with FastAPI (Python) backend and React + TypeScript frontend.

## Recent Changes (November 9, 2025)
- Initial project setup with FastAPI backend and React frontend
- Implemented complete CRUD API for user management
- Created PostgreSQL database schema with users and friendships tables
- Built React Flow graph visualization with drag-and-drop functionality
- Implemented popularity score calculation system
- Added hobby management with drag-and-drop to assign hobbies to users
- Configured Tailwind CSS for styling
- Set up dual workflows for backend and frontend servers

## Project Architecture

### Backend (FastAPI + PostgreSQL)
**Location**: `/backend/`

**Key Files**:
- `main.py`: FastAPI application with all REST endpoints
- `models.py`: SQLAlchemy models for User and Friendship relationships
- `schemas.py`: Pydantic schemas for request/response validation
- `database.py`: Database configuration and session management

**Database Schema**:
- `users` table: id, username, age, hobbies[], created_at
- `friendships` table: Many-to-many relationship between users

**Business Logic**:
- Popularity score = friends_count + (shared_hobbies × 0.5)
- Circular friendship prevention (bidirectional storage)
- Users cannot be deleted while they have active friendships

### Frontend (React + TypeScript)
**Location**: `/frontend/`

**Key Components**:
- `GraphCanvas.tsx`: React Flow graph with nodes and edges
- `UserNode.tsx`: Custom node component with drop zone for hobbies
- `HobbySidebar.tsx`: Draggable hobby list with search and filtering
- `UserPanel.tsx`: User CRUD interface with forms
- `AppContext.tsx`: Global state management with React Context

**Features**:
- Real-time graph updates when data changes
- Drag-and-drop for creating friendships and adding hobbies
- Dynamic node styling based on popularity score
- Toast notifications for all operations
- Loading states during API calls

### State Management
Using React Context API for:
- User list and graph data synchronization
- Loading states
- Selected user tracking
- Centralized API calls with error handling

## API Endpoints

### Users
- `GET /api/users` - List all users with popularity scores
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get specific user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (requires no friendships)

### Friendships
- `POST /api/users/{id}/link` - Create friendship
- `DELETE /api/users/{id}/unlink` - Remove friendship

### Graph
- `GET /api/graph` - Get all nodes and edges for visualization

## Dependencies

### Backend
- fastapi==0.109.0
- uvicorn[standard]==0.27.0
- sqlalchemy==2.0.25
- psycopg2-binary==2.9.9
- pydantic==2.5.3

### Frontend
- react + typescript
- reactflow (graph visualization)
- react-dnd + react-dnd-html5-backend (drag-and-drop)
- react-hot-toast (notifications)
- axios (HTTP client)
- tailwindcss (styling)

## Running the Application

The project uses two workflows:
1. **backend**: Runs FastAPI server on port 8000
2. **frontend**: Runs Vite dev server on port 5000

Both workflows start automatically. The frontend is accessible via the webview.

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `PORT`: Backend server port (default: 8000)

## Development Notes
- Database tables are created automatically on first run
- CORS is enabled for all origins (development mode)
- Frontend uses Vite for hot module replacement
- Backend uses Uvicorn with auto-reload
- All API responses include popularity scores computed in real-time
