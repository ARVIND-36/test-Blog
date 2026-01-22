# StudentHub 🎓

A full-stack platform for students to share blogs, ask questions, and engage with a community. Built with Flask (Python) backend and Next.js (TypeScript) frontend.

## Features

- **User Authentication**: Email OTP verification, GitHub & Google OAuth
- **Blogs**: Create, read, update, delete blog posts
- **Questions & Answers**: Ask questions with threaded comments
- **Voting**: Reddit-style upvote/downvote system
- **Tags**: Organize content with tags
- **Search**: Full-text search across blogs and questions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Flask, SQLAlchemy, Flask-Migrate |
| Database | PostgreSQL 15 |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Auth | Flask-Login, Authlib (OAuth), Flask-Mail (OTP) |
| Container | Docker, Docker Compose |

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/studenthub.git
cd studenthub

# Copy environment variables
cp .env.example .env

# Edit .env with your OAuth credentials (optional for basic use)

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend flask db upgrade
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 15 (or use Docker)

### Backend Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d db

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r app/req.txt

# Run migrations
flask db upgrade

# Start backend
python run.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `FLASK_SECRET_KEY` | Secret key for sessions |
| `MAIL_SERVER` | SMTP server for OTP emails |
| `MAIL_USERNAME` | SMTP username |
| `MAIL_PASSWORD` | SMTP password/app password |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login user |
| GET | `/logout` | Logout user |
| POST | `/auth/send-otp` | Send OTP to email |
| POST | `/auth/verify-otp` | Verify OTP & create account |
| GET | `/auth/github` | GitHub OAuth login |
| GET | `/auth/google` | Google OAuth login |
| GET | `/blogs` | List all blogs |
| POST | `/blogs` | Create blog |
| GET | `/questions` | List all questions |
| POST | `/questions` | Create question |
| POST | `/questions/<id>/comments` | Add comment |
| POST | `/questions/<id>/vote` | Vote on question |
| GET | `/tags` | List all tags |
| GET | `/search?q=query` | Search content |

## Project Structure

```
studenthub/
├── app/                    # Flask backend
│   ├── __init__.py         # App factory
│   ├── models.py           # SQLAlchemy models
│   ├── routes.py           # API routes
│   ├── auth_routes.py      # OAuth & OTP routes
│   └── req.txt             # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   └── lib/            # API client
│   └── package.json
├── migrations/             # Database migrations
├── docker-compose.yml      # Docker services
├── Dockerfile.backend      # Backend container
├── Dockerfile.frontend     # Frontend container
└── .env.example            # Environment template
```

## License

MIT