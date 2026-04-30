# Commitment Score App

A web application for tracking and scoring commitment metrics.

## Project Structure

```
commitment-score-app/
├── backend/          # FastAPI backend (Python 3.11)
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # Next.js 14 frontend
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Tech Stack

- **Backend**: FastAPI, Python 3.11, SQLAlchemy, PostgreSQL 15
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Database**: PostgreSQL 15
- **Containerization**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git (for version control)

### Setup Instructions

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd commitment-score-app
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

4. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Development

**View logs**:
```bash
docker-compose logs -f
```

**Restart services**:
```bash
docker-compose restart
```

**Stop all services**:
```bash
docker-compose down
```

**Stop and remove volumes** (resets database):
```bash
docker-compose down -v
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Database

- **Host**: postgres (internal network)
- **Port**: 5432
- **Database**: commitment_score
- **User**: postgres
- **Password**: postgres

## Testing

Validate Docker Compose configuration:
```bash
docker-compose config
```

## License

MIT
