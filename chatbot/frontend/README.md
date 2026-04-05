# Sikkim Monastery Chatbot Frontend

React-based frontend for the Sikkim Monastery Digital Experience chatbot.

## Features

- Interactive monastery gallery
- Travel tips and information
- Real-time chatbot widget (Tenzin)
- Responsive design
- TailwindCSS styling

## Prerequisites

- Node.js 14+ or npm 6+
- Yarn or npm

## Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_BACKEND_URL=https://web-production-d23ea.up.railway.app
```

**Available configurations:**

- `.env` - Main environment file
- `.env.development` - For local development (uses localhost:8000)
- `.env.production` - For production build (uses Railway backend)
- `.env.example` - Template with all available variables

## Development

Start the development server:

```bash
npm start
# or
yarn start
```

The app will open at `http://localhost:3000`

For local testing with backend:
```bash
# In .env or .env.development
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Building

Create a production build:

```bash
npm run build
# or
yarn build
```

The optimized build will be in the `build/` directory.

## API Integration

The frontend connects to the backend at the URL specified in `REACT_APP_BACKEND_URL`.

### Endpoints Used:

- `GET /api/monasteries` - Fetch all monasteries
- `GET /api/travel-tips` - Fetch travel information
- `POST /api/chat` - Send chat messages to Tenzin

### Backend Connection:

```
Production: https://web-production-d23ea.up.railway.app
Development: http://localhost:8000
```

## CORS Configuration

Make sure your backend has CORS enabled. The backend at `web-production-d23ea.up.railway.app` already has CORS configured to accept requests from all origins.

## Troubleshooting

### Backend Connection Issues

If you see "connection had not momentarily faltered":

1. Check that backend is running and accessible
2. Verify `REACT_APP_BACKEND_URL` is correct in `.env`
3. Check browser console for CORS errors
4. Ensure API keys are configured on the backend

### Rebuild Required

After changing environment variables, stop and restart the dev server:

```bash
npm start
```

## Structure

```
src/
├── App.js              # Main app component
├── components/         # React components
│   ├── ChatbotWidget.js
│   ├── Header.js
│   ├── HeroSection.js
│   └── ...
├── index.js            # Entry point
└── index.css           # Global styles
```

## Technologies

- React 18+
- TailwindCSS
- Fetch API

## License

Part of the Sikkim Monastery Digital Experience initiative.
