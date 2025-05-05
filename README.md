# Welcome to Tweet Tribune

## Project Description

Tweet Tribune is a comprehensive Twitter analysis tool that helps users analyze tweets, schedule posts, and gain insights into their social media performance using AI-powered analytics.

## Features

- Tweet analysis and sentiment scoring
- Social media post scheduling
- Twitter API integration
- User authentication
- Analytics dashboard
- Tweet history tracking

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Express.js (integrated within the same codebase)
- API Integrations: Twitter API, OpenAI API

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Twitter API credentials
- OpenAI API key

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd tweet-tribune

# Install dependencies
npm install

# Create a .env file (copy from .env.sample)
cp .env.sample .env

# Fill in your environment variables in the .env file
# - TWITTER_API_KEY
# - TWITTER_API_SECRET
# - OPENAI_API_KEY

# Start the development server (frontend and backend)
npm run start
```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

- Frontend: http://localhost:5173
- Backend: http://localhost:3001 (accessed via proxy)

## Development Scripts

- `npm run dev` - Start frontend development server
- `npm run server:dev` - Start backend server with auto-restart
- `npm run start` - Start both frontend and backend (for development)
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
/
├── public/             # Static assets
├── src/
│   ├── api/            # Backend API code
│   │   ├── routes/     # Express route definitions
│   │   ├── services/   # Business logic and external services
│   │   ├── server.js   # Express server setup
│   │   └── index.js    # Server entry point
│   ├── components/     # React components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── App.tsx         # Main React component
│   └── main.tsx        # Application entry point
├── .env                # Environment variables (not committed)
├── .env.sample         # Sample environment variables
└── package.json        # Project dependencies and scripts
```

## Deployment

For production deployment, build the frontend and start the server:

```sh
npm run build
npm run server
```

## License

[MIT License]
