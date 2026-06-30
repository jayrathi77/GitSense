# GitSense Server

Backend API for GitSense - GitHub profile analysis with AI scoring.

## Setup

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Required environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `GITHUB_TOKEN`: GitHub personal access token (for API rate limits)
   - `GEMINI_API_KEY`: Google Gemini API key (for AI analysis)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Analysis
- `POST /api/analysis` - Analyze GitHub profile (protected)
- `GET /api/analysis/:id` - Get specific analysis (protected)

### History
- `GET /api/history` - Get user's analysis history (protected)
