# GitSense

AI-powered GitHub profile analysis tool that evaluates developer skills, portfolio quality, and provides actionable insights for improvement.

## Features

- **GitHub Integration**: Fetches real data from GitHub including repositories, languages, and activity
- **AI Analysis**: Powered by Google Gemini to provide insights on strengths, weaknesses, and learning paths
- **Smart Caching**: Results cached for 7 days to save API calls and provide instant access
- **Comprehensive Scoring**: 7-dimensional scoring across developer skills, recruiter readiness, and technical areas
- **Visual Analytics**: Interactive charts for language distribution, repository growth, and skill radar
- **History Tracking**: View and revisit past analyses

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- GitHub REST API
- Google Gemini AI API

### Frontend
- React + Vite
- React Router
- TailwindCSS
- Recharts (visualizations)
- Lucide React (icons)

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- GitHub Personal Access Token
- Google Gemini API Key

## Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd git-sense
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gitsense
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
GITHUB_TOKEN=your-github-personal-access-token
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:5173
```

Install dependencies:
```bash
npm install
```

### 3. Frontend Setup

```bash
cd ../client
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies:
```bash
npm install
```

### 4. Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas connection string in `.env`.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Analysis
- `POST /api/analysis` - Analyze GitHub profile (protected)
- `GET /api/analysis/:id` - Get specific analysis (protected)

### History
- `GET /api/history` - Get user's analysis history (protected)

## Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables in deployment dashboard
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_URL` to production backend URL
4. Deploy

## Architecture Highlights

- **Service Layer Pattern**: Business logic isolated in services, controllers remain thin
- **Caching Strategy**: MongoDB-based caching with TTL for cost efficiency
- **Error Handling**: Centralized error middleware with consistent API responses
- **Security**: Helmet, CORS, rate limiting, JWT authentication, bcrypt password hashing
- **Separation of Concerns**: Clear separation between models, controllers, services, and routes

## Getting API Keys

### GitHub Personal Access Token
1. Go to GitHub Settings → Developer Settings → Personal access tokens
2. Generate new token with `public_repo` scope
3. Copy and add to `.env`

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy and add to `.env`

## License

MIT
