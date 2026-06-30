# GitSense Client

React frontend for GitSense - GitHub profile analysis with AI scoring.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Set the API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

## Features

- User authentication (register/login)
- GitHub profile search and analysis
- Interactive visualizations (charts, radar graphs)
- Analysis history
- Dark mode support
- Responsive design
