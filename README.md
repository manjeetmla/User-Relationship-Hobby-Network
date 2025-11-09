User Relationship & Hobby Network
An interactive full-stack social network application with dynamic graph visualization of users, friendships, and hobby-based popularity scoring.

Features
Backend: FastAPI REST API with user CRUD and friendship management

Database: PostgreSQL with schema for users, friendships, hobbies

Popularity Score: Calculated as friends_count + (shared_hobbies × 0.5)

Graph Visualization: React Flow with dynamic nodes and edges

Drag-and-Drop: Add hobbies and friendships via UI interactions

Business Rules: Circular friendship prevention, unlink-before-delete

State Management: React Context for frontend-backend sync

Notifications: Toast messages and error handling with HTTP status codes

Styling: Nodes color-coded and sized based on popularity score

Project Structure
.
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── database.py
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt
├── docker-compose.yml
├── backend/Dockerfile
├── frontend/Dockerfile
└── README.md

Setup and Run with Docker
Prerequisites
Docker and Docker Compose installed on your machine

Steps
Clone the repository or extract the project ZIP:

bash
git clone https://github.com/manjeetmla/User-Relationship-Hobby-Network.git
Make sure your .env file or environment variables are set correctly for the database URL in backend:

text
DATABASE_URL=postgresql://postgres:password@db:5432/userhobbydb
PORT=8000
Build and start all services (database, backend, frontend):

bash
docker-compose up --build
Access the application:

Frontend UI: http://localhost:3001

Backend API: http://localhost:8000

Available Docker Services
db: PostgreSQL 15 Alpine database with volume persistence

backend: FastAPI server running on port 8000

frontend: React + Vite app served via Nginx on port 3001

Usage
Create new users with hobbies from the right-side panel

Drag hobby items onto user nodes to dynamically add hobbies

Create friendships by dragging one user node onto another

Edit or delete users (note: users with active friendships cannot be deleted until unlinked)

Popularity scores update live and nodes change color and size dynamically

Development Notes
Backend built with FastAPI, SQLAlchemy ORM, and Pydantic schemas

Frontend built with React 18, TypeScript, React Flow, React DnD, Tailwind CSS

Real-time UI updates and notifications with React Context and React Hot Toast

Business logic enforced at backend API level including validations and error handling

Troubleshooting
Ensure Docker for Windows/Mac/Linux is running properly

If ports 3001 or 8000 are busy, update them in docker-compose.yml

Confirm environment variables are loaded correctly in Docker container (e.g. DATABASE_URL)

Check container logs with:

bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
